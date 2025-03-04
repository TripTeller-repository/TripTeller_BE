const dotenv = require('dotenv');
const path = require('path');
const { MongoClient } = require('mongodb');

const envPath = path.resolve(
  __dirname,
  '..',
  process.env.NODE_ENV === 'production' ? 'production.env' : '.development.env',
);

dotenv.config({ path: envPath });

async function migrateData() {
  console.log('Starting OAuth user migration...');

  // MongoDB 연결
  const uri = process.env.MONGODB_URL;

  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(); // 데이터베이스 이름이 URI에 포함됨
    const userCollection = db.collection('User');
    const oauthCollection = db.collection('UserOAuth');

    // UserOAuth 컬렉션이 없으면 생성
    const collections = await db.listCollections({ name: 'UserOAuth' }).toArray();
    if (collections.length === 0) {
      console.log('Creating UserOAuth collection...');
      await db.createCollection('UserOAuth');

      // 복합 인덱스 생성
      await oauthCollection.createIndex({ provider: 1, providerId: 1 }, { unique: true });

      // userId 인덱스 생성
      await oauthCollection.createIndex({ userId: 1 });
    }

    // 소셜 로그인 사용자 찾기
    const socialUsers = await userCollection
      .find({
        authProvider: { $ne: null, $in: ['Google', 'Naver', 'Kakao'] },
      })
      .toArray();

    console.log(`Found ${socialUsers.length} social login users to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    // 각 사용자에 대해 OAuth 연결 생성
    for (const user of socialUsers) {
      try {
        // 이미 마이그레이션된 사용자인지 확인
        const existingOAuth = await oauthCollection.findOne({
          userId: user._id,
        });

        if (existingOAuth) {
          console.log(`User ${user._id} already has OAuth connections, skipping...`);
          skippedCount++;
          continue;
        }

        // UserOAuth 문서 생성
        const oauthData = {
          userId: user._id,
          provider: user.authProvider,
          providerId: `legacy_${user._id.toString()}`, // 기존 providerId가 없으므로 임시 값 설정
          email: user.email,
          profile: {},
          lastUsedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await oauthCollection.insertOne(oauthData);
        migratedCount++;

        console.log(`Migrated user ${user._id} with provider ${user.authProvider}`);
      } catch (err) {
        console.error(`Error migrating user ${user._id}:`, err.message);
      }
    }

    console.log(`Migration completed: ${migratedCount} users migrated, ${skippedCount} users skipped`);
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// 스크립트 실행
migrateData().catch(console.error);
