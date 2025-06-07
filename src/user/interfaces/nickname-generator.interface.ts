export interface INicknameGenerator {
  generateUniqueNickname(nickname: string): Promise<string>;
}
