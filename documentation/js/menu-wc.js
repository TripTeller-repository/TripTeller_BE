'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">tripteller documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-bf4a1d76e430cffb2126081b3fd71dc0f0e04a9d6ec9051af8052e7f5d50669821769d2a7175f389799b6d6468ea503c7d05fe04d4973eb17b9edd31f86f7b4a"' : 'data-bs-target="#xs-controllers-links-module-AppModule-bf4a1d76e430cffb2126081b3fd71dc0f0e04a9d6ec9051af8052e7f5d50669821769d2a7175f389799b6d6468ea503c7d05fe04d4973eb17b9edd31f86f7b4a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-bf4a1d76e430cffb2126081b3fd71dc0f0e04a9d6ec9051af8052e7f5d50669821769d2a7175f389799b6d6468ea503c7d05fe04d4973eb17b9edd31f86f7b4a"' :
                                            'id="xs-controllers-links-module-AppModule-bf4a1d76e430cffb2126081b3fd71dc0f0e04a9d6ec9051af8052e7f5d50669821769d2a7175f389799b6d6468ea503c7d05fe04d4973eb17b9edd31f86f7b4a"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-bf4a1d76e430cffb2126081b3fd71dc0f0e04a9d6ec9051af8052e7f5d50669821769d2a7175f389799b6d6468ea503c7d05fe04d4973eb17b9edd31f86f7b4a"' : 'data-bs-target="#xs-injectables-links-module-AppModule-bf4a1d76e430cffb2126081b3fd71dc0f0e04a9d6ec9051af8052e7f5d50669821769d2a7175f389799b6d6468ea503c7d05fe04d4973eb17b9edd31f86f7b4a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-bf4a1d76e430cffb2126081b3fd71dc0f0e04a9d6ec9051af8052e7f5d50669821769d2a7175f389799b6d6468ea503c7d05fe04d4973eb17b9edd31f86f7b4a"' :
                                        'id="xs-injectables-links-module-AppModule-bf4a1d76e430cffb2126081b3fd71dc0f0e04a9d6ec9051af8052e7f5d50669821769d2a7175f389799b6d6468ea503c7d05fe04d4973eb17b9edd31f86f7b4a"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-733487dde4a66427d097f0a74bba02e8a2b78c5a932f9937ce479682ac7fe4bc8eefc3161344481a2b234bd686bba5fa65183638207947103a18401ef8008e73"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-733487dde4a66427d097f0a74bba02e8a2b78c5a932f9937ce479682ac7fe4bc8eefc3161344481a2b234bd686bba5fa65183638207947103a18401ef8008e73"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-733487dde4a66427d097f0a74bba02e8a2b78c5a932f9937ce479682ac7fe4bc8eefc3161344481a2b234bd686bba5fa65183638207947103a18401ef8008e73"' :
                                            'id="xs-controllers-links-module-AuthModule-733487dde4a66427d097f0a74bba02e8a2b78c5a932f9937ce479682ac7fe4bc8eefc3161344481a2b234bd686bba5fa65183638207947103a18401ef8008e73"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-733487dde4a66427d097f0a74bba02e8a2b78c5a932f9937ce479682ac7fe4bc8eefc3161344481a2b234bd686bba5fa65183638207947103a18401ef8008e73"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-733487dde4a66427d097f0a74bba02e8a2b78c5a932f9937ce479682ac7fe4bc8eefc3161344481a2b234bd686bba5fa65183638207947103a18401ef8008e73"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-733487dde4a66427d097f0a74bba02e8a2b78c5a932f9937ce479682ac7fe4bc8eefc3161344481a2b234bd686bba5fa65183638207947103a18401ef8008e73"' :
                                        'id="xs-injectables-links-module-AuthModule-733487dde4a66427d097f0a74bba02e8a2b78c5a932f9937ce479682ac7fe4bc8eefc3161344481a2b234bd686bba5fa65183638207947103a18401ef8008e73"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CommonModule.html" data-type="entity-link" >CommonModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CommonModule-1acab01cf5731f9bd885d0398c28510f2511155545dcf6aed7fc0a50144969ef407a32465917217e10f73de2b73c2817384f91e9ba0de52e8796c88d563e278d"' : 'data-bs-target="#xs-injectables-links-module-CommonModule-1acab01cf5731f9bd885d0398c28510f2511155545dcf6aed7fc0a50144969ef407a32465917217e10f73de2b73c2817384f91e9ba0de52e8796c88d563e278d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CommonModule-1acab01cf5731f9bd885d0398c28510f2511155545dcf6aed7fc0a50144969ef407a32465917217e10f73de2b73c2817384f91e9ba0de52e8796c88d563e278d"' :
                                        'id="xs-injectables-links-module-CommonModule-1acab01cf5731f9bd885d0398c28510f2511155545dcf6aed7fc0a50144969ef407a32465917217e10f73de2b73c2817384f91e9ba0de52e8796c88d563e278d"' }>
                                        <li class="link">
                                            <a href="injectables/FeedScrapService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FeedScrapService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ConfigModule.html" data-type="entity-link" >ConfigModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CustomSwaggerModule.html" data-type="entity-link" >CustomSwaggerModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DailyPlanModule.html" data-type="entity-link" >DailyPlanModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-DailyPlanModule-7b6067f37b2e00c3dd975448de85c16c925ed08dbb7dfbe63bfeb2683515854ef692a4eeb4444f539152a374caa44c8ac0d9061000c796970f8327a006d1b257"' : 'data-bs-target="#xs-controllers-links-module-DailyPlanModule-7b6067f37b2e00c3dd975448de85c16c925ed08dbb7dfbe63bfeb2683515854ef692a4eeb4444f539152a374caa44c8ac0d9061000c796970f8327a006d1b257"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-DailyPlanModule-7b6067f37b2e00c3dd975448de85c16c925ed08dbb7dfbe63bfeb2683515854ef692a4eeb4444f539152a374caa44c8ac0d9061000c796970f8327a006d1b257"' :
                                            'id="xs-controllers-links-module-DailyPlanModule-7b6067f37b2e00c3dd975448de85c16c925ed08dbb7dfbe63bfeb2683515854ef692a4eeb4444f539152a374caa44c8ac0d9061000c796970f8327a006d1b257"' }>
                                            <li class="link">
                                                <a href="controllers/DailyPlanController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DailyPlanController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DailyPlanModule-7b6067f37b2e00c3dd975448de85c16c925ed08dbb7dfbe63bfeb2683515854ef692a4eeb4444f539152a374caa44c8ac0d9061000c796970f8327a006d1b257"' : 'data-bs-target="#xs-injectables-links-module-DailyPlanModule-7b6067f37b2e00c3dd975448de85c16c925ed08dbb7dfbe63bfeb2683515854ef692a4eeb4444f539152a374caa44c8ac0d9061000c796970f8327a006d1b257"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DailyPlanModule-7b6067f37b2e00c3dd975448de85c16c925ed08dbb7dfbe63bfeb2683515854ef692a4eeb4444f539152a374caa44c8ac0d9061000c796970f8327a006d1b257"' :
                                        'id="xs-injectables-links-module-DailyPlanModule-7b6067f37b2e00c3dd975448de85c16c925ed08dbb7dfbe63bfeb2683515854ef692a4eeb4444f539152a374caa44c8ac0d9061000c796970f8327a006d1b257"' }>
                                        <li class="link">
                                            <a href="injectables/DailyPlanService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DailyPlanService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DailyScheduleService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DailyScheduleService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ExpenseService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExpenseService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DailyScheduleModule.html" data-type="entity-link" >DailyScheduleModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-DailyScheduleModule-322c871bb9924f29dd03ae03b04d5a15ec103891ae51156c74b3798741fd49d8661c26ba949c5f5069f9a18628d0540742e42a522ee8cc0d451c2884baebf7a2"' : 'data-bs-target="#xs-controllers-links-module-DailyScheduleModule-322c871bb9924f29dd03ae03b04d5a15ec103891ae51156c74b3798741fd49d8661c26ba949c5f5069f9a18628d0540742e42a522ee8cc0d451c2884baebf7a2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-DailyScheduleModule-322c871bb9924f29dd03ae03b04d5a15ec103891ae51156c74b3798741fd49d8661c26ba949c5f5069f9a18628d0540742e42a522ee8cc0d451c2884baebf7a2"' :
                                            'id="xs-controllers-links-module-DailyScheduleModule-322c871bb9924f29dd03ae03b04d5a15ec103891ae51156c74b3798741fd49d8661c26ba949c5f5069f9a18628d0540742e42a522ee8cc0d451c2884baebf7a2"' }>
                                            <li class="link">
                                                <a href="controllers/DailyScheduleController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DailyScheduleController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DailyScheduleModule-322c871bb9924f29dd03ae03b04d5a15ec103891ae51156c74b3798741fd49d8661c26ba949c5f5069f9a18628d0540742e42a522ee8cc0d451c2884baebf7a2"' : 'data-bs-target="#xs-injectables-links-module-DailyScheduleModule-322c871bb9924f29dd03ae03b04d5a15ec103891ae51156c74b3798741fd49d8661c26ba949c5f5069f9a18628d0540742e42a522ee8cc0d451c2884baebf7a2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DailyScheduleModule-322c871bb9924f29dd03ae03b04d5a15ec103891ae51156c74b3798741fd49d8661c26ba949c5f5069f9a18628d0540742e42a522ee8cc0d451c2884baebf7a2"' :
                                        'id="xs-injectables-links-module-DailyScheduleModule-322c871bb9924f29dd03ae03b04d5a15ec103891ae51156c74b3798741fd49d8661c26ba949c5f5069f9a18628d0540742e42a522ee8cc0d451c2884baebf7a2"' }>
                                        <li class="link">
                                            <a href="injectables/DailyPlanService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DailyPlanService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DailyScheduleIndexService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DailyScheduleIndexService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DailyScheduleService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DailyScheduleService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TravelLogService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TravelLogService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ExpenseModule.html" data-type="entity-link" >ExpenseModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ExpenseModule-487de72c39e6db6d9f5a2c05f359f446c333badc65f3d69663656ef1dbaa554516e02320126b1d46056e7f3667c82461800d157d50c6975570b82f25b5f813c0"' : 'data-bs-target="#xs-controllers-links-module-ExpenseModule-487de72c39e6db6d9f5a2c05f359f446c333badc65f3d69663656ef1dbaa554516e02320126b1d46056e7f3667c82461800d157d50c6975570b82f25b5f813c0"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ExpenseModule-487de72c39e6db6d9f5a2c05f359f446c333badc65f3d69663656ef1dbaa554516e02320126b1d46056e7f3667c82461800d157d50c6975570b82f25b5f813c0"' :
                                            'id="xs-controllers-links-module-ExpenseModule-487de72c39e6db6d9f5a2c05f359f446c333badc65f3d69663656ef1dbaa554516e02320126b1d46056e7f3667c82461800d157d50c6975570b82f25b5f813c0"' }>
                                            <li class="link">
                                                <a href="controllers/ExpenseController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExpenseController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ExpenseModule-487de72c39e6db6d9f5a2c05f359f446c333badc65f3d69663656ef1dbaa554516e02320126b1d46056e7f3667c82461800d157d50c6975570b82f25b5f813c0"' : 'data-bs-target="#xs-injectables-links-module-ExpenseModule-487de72c39e6db6d9f5a2c05f359f446c333badc65f3d69663656ef1dbaa554516e02320126b1d46056e7f3667c82461800d157d50c6975570b82f25b5f813c0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ExpenseModule-487de72c39e6db6d9f5a2c05f359f446c333badc65f3d69663656ef1dbaa554516e02320126b1d46056e7f3667c82461800d157d50c6975570b82f25b5f813c0"' :
                                        'id="xs-injectables-links-module-ExpenseModule-487de72c39e6db6d9f5a2c05f359f446c333badc65f3d69663656ef1dbaa554516e02320126b1d46056e7f3667c82461800d157d50c6975570b82f25b5f813c0"' }>
                                        <li class="link">
                                            <a href="injectables/ExpenseService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExpenseService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/FeedModule.html" data-type="entity-link" >FeedModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-FeedModule-41df298e3d5ddedb0d050df9134bffa780318691677ab416c086ec5d8731f3dd8b7a9db5d25ddb89d9f9e69ce2c063f499f77cedf3ff6cf8ca22c6c9cd30e8a3"' : 'data-bs-target="#xs-injectables-links-module-FeedModule-41df298e3d5ddedb0d050df9134bffa780318691677ab416c086ec5d8731f3dd8b7a9db5d25ddb89d9f9e69ce2c063f499f77cedf3ff6cf8ca22c6c9cd30e8a3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FeedModule-41df298e3d5ddedb0d050df9134bffa780318691677ab416c086ec5d8731f3dd8b7a9db5d25ddb89d9f9e69ce2c063f499f77cedf3ff6cf8ca22c6c9cd30e8a3"' :
                                        'id="xs-injectables-links-module-FeedModule-41df298e3d5ddedb0d050df9134bffa780318691677ab416c086ec5d8731f3dd8b7a9db5d25ddb89d9f9e69ce2c063f499f77cedf3ff6cf8ca22c6c9cd30e8a3"' }>
                                        <li class="link">
                                            <a href="injectables/FeedExtractor.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FeedExtractor</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FeedService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FeedService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/FileModule.html" data-type="entity-link" >FileModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-FileModule-e43d09ba6e058c20aed0280490b90ff9d31073a8b5e18daccd57aa3bfe7a7734c359aeaacd0327d72ac99017dbe16237a4682741584ed45784b1f883668bbc44"' : 'data-bs-target="#xs-injectables-links-module-FileModule-e43d09ba6e058c20aed0280490b90ff9d31073a8b5e18daccd57aa3bfe7a7734c359aeaacd0327d72ac99017dbe16237a4682741584ed45784b1f883668bbc44"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FileModule-e43d09ba6e058c20aed0280490b90ff9d31073a8b5e18daccd57aa3bfe7a7734c359aeaacd0327d72ac99017dbe16237a4682741584ed45784b1f883668bbc44"' :
                                        'id="xs-injectables-links-module-FileModule-e43d09ba6e058c20aed0280490b90ff9d31073a8b5e18daccd57aa3bfe7a7734c359aeaacd0327d72ac99017dbe16237a4682741584ed45784b1f883668bbc44"' }>
                                        <li class="link">
                                            <a href="injectables/FileUtilService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileUtilService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/S3Service.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >S3Service</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MyTripModule.html" data-type="entity-link" >MyTripModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-MyTripModule-6ae10050ff94fdf4982afb88cc49d4bafc4b0c79bd91d08946a589beb26d93f57ff4bf7d98d4f232941f00938299a761990faf92f5f7f41a47a75e89a01f0a6a"' : 'data-bs-target="#xs-controllers-links-module-MyTripModule-6ae10050ff94fdf4982afb88cc49d4bafc4b0c79bd91d08946a589beb26d93f57ff4bf7d98d4f232941f00938299a761990faf92f5f7f41a47a75e89a01f0a6a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-MyTripModule-6ae10050ff94fdf4982afb88cc49d4bafc4b0c79bd91d08946a589beb26d93f57ff4bf7d98d4f232941f00938299a761990faf92f5f7f41a47a75e89a01f0a6a"' :
                                            'id="xs-controllers-links-module-MyTripModule-6ae10050ff94fdf4982afb88cc49d4bafc4b0c79bd91d08946a589beb26d93f57ff4bf7d98d4f232941f00938299a761990faf92f5f7f41a47a75e89a01f0a6a"' }>
                                            <li class="link">
                                                <a href="controllers/MyTripController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MyTripController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MyTripModule-6ae10050ff94fdf4982afb88cc49d4bafc4b0c79bd91d08946a589beb26d93f57ff4bf7d98d4f232941f00938299a761990faf92f5f7f41a47a75e89a01f0a6a"' : 'data-bs-target="#xs-injectables-links-module-MyTripModule-6ae10050ff94fdf4982afb88cc49d4bafc4b0c79bd91d08946a589beb26d93f57ff4bf7d98d4f232941f00938299a761990faf92f5f7f41a47a75e89a01f0a6a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MyTripModule-6ae10050ff94fdf4982afb88cc49d4bafc4b0c79bd91d08946a589beb26d93f57ff4bf7d98d4f232941f00938299a761990faf92f5f7f41a47a75e89a01f0a6a"' :
                                        'id="xs-injectables-links-module-MyTripModule-6ae10050ff94fdf4982afb88cc49d4bafc4b0c79bd91d08946a589beb26d93f57ff4bf7d98d4f232941f00938299a761990faf92f5f7f41a47a75e89a01f0a6a"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MyTripService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MyTripService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TravelPlanService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TravelPlanService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OurTripModule.html" data-type="entity-link" >OurTripModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-OurTripModule-662c1185ef704abec82dcb73e448cedf847ce4c4225b4a0f07d0e3b27c579bbcce6da88af9e3587c53d351127b834217ccb05dc9919b399a25fcab18dd10c05b"' : 'data-bs-target="#xs-controllers-links-module-OurTripModule-662c1185ef704abec82dcb73e448cedf847ce4c4225b4a0f07d0e3b27c579bbcce6da88af9e3587c53d351127b834217ccb05dc9919b399a25fcab18dd10c05b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OurTripModule-662c1185ef704abec82dcb73e448cedf847ce4c4225b4a0f07d0e3b27c579bbcce6da88af9e3587c53d351127b834217ccb05dc9919b399a25fcab18dd10c05b"' :
                                            'id="xs-controllers-links-module-OurTripModule-662c1185ef704abec82dcb73e448cedf847ce4c4225b4a0f07d0e3b27c579bbcce6da88af9e3587c53d351127b834217ccb05dc9919b399a25fcab18dd10c05b"' }>
                                            <li class="link">
                                                <a href="controllers/OurTripController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OurTripController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OurTripModule-662c1185ef704abec82dcb73e448cedf847ce4c4225b4a0f07d0e3b27c579bbcce6da88af9e3587c53d351127b834217ccb05dc9919b399a25fcab18dd10c05b"' : 'data-bs-target="#xs-injectables-links-module-OurTripModule-662c1185ef704abec82dcb73e448cedf847ce4c4225b4a0f07d0e3b27c579bbcce6da88af9e3587c53d351127b834217ccb05dc9919b399a25fcab18dd10c05b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OurTripModule-662c1185ef704abec82dcb73e448cedf847ce4c4225b4a0f07d0e3b27c579bbcce6da88af9e3587c53d351127b834217ccb05dc9919b399a25fcab18dd10c05b"' :
                                        'id="xs-injectables-links-module-OurTripModule-662c1185ef704abec82dcb73e448cedf847ce4c4225b4a0f07d0e3b27c579bbcce6da88af9e3587c53d351127b834217ccb05dc9919b399a25fcab18dd10c05b"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OurTripService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OurTripService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ScrapModule.html" data-type="entity-link" >ScrapModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ScrapModule-11a72a12f48617f343dba633a32be87f188aaa7acaf868d5c3e5eb73dae6cdc56b9a6b3a7c238891bff2503deb457833c6b4dde47094024315218589c710f93f"' : 'data-bs-target="#xs-controllers-links-module-ScrapModule-11a72a12f48617f343dba633a32be87f188aaa7acaf868d5c3e5eb73dae6cdc56b9a6b3a7c238891bff2503deb457833c6b4dde47094024315218589c710f93f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ScrapModule-11a72a12f48617f343dba633a32be87f188aaa7acaf868d5c3e5eb73dae6cdc56b9a6b3a7c238891bff2503deb457833c6b4dde47094024315218589c710f93f"' :
                                            'id="xs-controllers-links-module-ScrapModule-11a72a12f48617f343dba633a32be87f188aaa7acaf868d5c3e5eb73dae6cdc56b9a6b3a7c238891bff2503deb457833c6b4dde47094024315218589c710f93f"' }>
                                            <li class="link">
                                                <a href="controllers/ScrapController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScrapController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ScrapModule-11a72a12f48617f343dba633a32be87f188aaa7acaf868d5c3e5eb73dae6cdc56b9a6b3a7c238891bff2503deb457833c6b4dde47094024315218589c710f93f"' : 'data-bs-target="#xs-injectables-links-module-ScrapModule-11a72a12f48617f343dba633a32be87f188aaa7acaf868d5c3e5eb73dae6cdc56b9a6b3a7c238891bff2503deb457833c6b4dde47094024315218589c710f93f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ScrapModule-11a72a12f48617f343dba633a32be87f188aaa7acaf868d5c3e5eb73dae6cdc56b9a6b3a7c238891bff2503deb457833c6b4dde47094024315218589c710f93f"' :
                                        'id="xs-injectables-links-module-ScrapModule-11a72a12f48617f343dba633a32be87f188aaa7acaf868d5c3e5eb73dae6cdc56b9a6b3a7c238891bff2503deb457833c6b4dde47094024315218589c710f93f"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ScrapService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScrapService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SearchModule.html" data-type="entity-link" >SearchModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SearchModule-8ce5d8b4a7d1cc7cd2b5381c44b4eb1a7284786ecb930908a7c028ef5ebaa584402bf716fe76501ed7964387a0d7050f2cac98a09dc5afc0b18c907e91b3569b"' : 'data-bs-target="#xs-controllers-links-module-SearchModule-8ce5d8b4a7d1cc7cd2b5381c44b4eb1a7284786ecb930908a7c028ef5ebaa584402bf716fe76501ed7964387a0d7050f2cac98a09dc5afc0b18c907e91b3569b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SearchModule-8ce5d8b4a7d1cc7cd2b5381c44b4eb1a7284786ecb930908a7c028ef5ebaa584402bf716fe76501ed7964387a0d7050f2cac98a09dc5afc0b18c907e91b3569b"' :
                                            'id="xs-controllers-links-module-SearchModule-8ce5d8b4a7d1cc7cd2b5381c44b4eb1a7284786ecb930908a7c028ef5ebaa584402bf716fe76501ed7964387a0d7050f2cac98a09dc5afc0b18c907e91b3569b"' }>
                                            <li class="link">
                                                <a href="controllers/SearchController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SearchModule-8ce5d8b4a7d1cc7cd2b5381c44b4eb1a7284786ecb930908a7c028ef5ebaa584402bf716fe76501ed7964387a0d7050f2cac98a09dc5afc0b18c907e91b3569b"' : 'data-bs-target="#xs-injectables-links-module-SearchModule-8ce5d8b4a7d1cc7cd2b5381c44b4eb1a7284786ecb930908a7c028ef5ebaa584402bf716fe76501ed7964387a0d7050f2cac98a09dc5afc0b18c907e91b3569b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SearchModule-8ce5d8b4a7d1cc7cd2b5381c44b4eb1a7284786ecb930908a7c028ef5ebaa584402bf716fe76501ed7964387a0d7050f2cac98a09dc5afc0b18c907e91b3569b"' :
                                        'id="xs-injectables-links-module-SearchModule-8ce5d8b4a7d1cc7cd2b5381c44b4eb1a7284786ecb930908a7c028ef5ebaa584402bf716fe76501ed7964387a0d7050f2cac98a09dc5afc0b18c907e91b3569b"' }>
                                        <li class="link">
                                            <a href="injectables/FeedExtractor.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FeedExtractor</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SearchByAuthorStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchByAuthorStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SearchByContentStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchByContentStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SearchByTitleStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchByTitleStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SearchService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SlackModule.html" data-type="entity-link" >SlackModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SlackModule-ed6da818f030c4eb1b6b74857a782314718c76058350053c0c641239df35a6e38052cfb8936720506c6d7ea5d394afa3b050b4efe96a56aaa603ce3e24506313"' : 'data-bs-target="#xs-injectables-links-module-SlackModule-ed6da818f030c4eb1b6b74857a782314718c76058350053c0c641239df35a6e38052cfb8936720506c6d7ea5d394afa3b050b4efe96a56aaa603ce3e24506313"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SlackModule-ed6da818f030c4eb1b6b74857a782314718c76058350053c0c641239df35a6e38052cfb8936720506c6d7ea5d394afa3b050b4efe96a56aaa603ce3e24506313"' :
                                        'id="xs-injectables-links-module-SlackModule-ed6da818f030c4eb1b6b74857a782314718c76058350053c0c641239df35a6e38052cfb8936720506c6d7ea5d394afa3b050b4efe96a56aaa603ce3e24506313"' }>
                                        <li class="link">
                                            <a href="injectables/SlackService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SlackService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TravelLogModule.html" data-type="entity-link" >TravelLogModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-TravelLogModule-cffc3e6947c829aafb6f616b7014badbeba67d35d4606efea97d254cec7f5b3ce0bc91c92518d729831c1bc7243e19ab98be9dede81b5651423d690b657d49f0"' : 'data-bs-target="#xs-controllers-links-module-TravelLogModule-cffc3e6947c829aafb6f616b7014badbeba67d35d4606efea97d254cec7f5b3ce0bc91c92518d729831c1bc7243e19ab98be9dede81b5651423d690b657d49f0"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-TravelLogModule-cffc3e6947c829aafb6f616b7014badbeba67d35d4606efea97d254cec7f5b3ce0bc91c92518d729831c1bc7243e19ab98be9dede81b5651423d690b657d49f0"' :
                                            'id="xs-controllers-links-module-TravelLogModule-cffc3e6947c829aafb6f616b7014badbeba67d35d4606efea97d254cec7f5b3ce0bc91c92518d729831c1bc7243e19ab98be9dede81b5651423d690b657d49f0"' }>
                                            <li class="link">
                                                <a href="controllers/TravelLogController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TravelLogController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TravelLogModule-cffc3e6947c829aafb6f616b7014badbeba67d35d4606efea97d254cec7f5b3ce0bc91c92518d729831c1bc7243e19ab98be9dede81b5651423d690b657d49f0"' : 'data-bs-target="#xs-injectables-links-module-TravelLogModule-cffc3e6947c829aafb6f616b7014badbeba67d35d4606efea97d254cec7f5b3ce0bc91c92518d729831c1bc7243e19ab98be9dede81b5651423d690b657d49f0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TravelLogModule-cffc3e6947c829aafb6f616b7014badbeba67d35d4606efea97d254cec7f5b3ce0bc91c92518d729831c1bc7243e19ab98be9dede81b5651423d690b657d49f0"' :
                                        'id="xs-injectables-links-module-TravelLogModule-cffc3e6947c829aafb6f616b7014badbeba67d35d4606efea97d254cec7f5b3ce0bc91c92518d729831c1bc7243e19ab98be9dede81b5651423d690b657d49f0"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TravelLogService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TravelLogService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TravelPlanModule.html" data-type="entity-link" >TravelPlanModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-TravelPlanModule-9d95228dec416f658e5f3bd31c5e5ee592da5b2fdec29b6eb2d1c6aa414619aacadbf2b6578bc272a318616216152e0814f05f81765c8359c3b77b6bde7e87c9"' : 'data-bs-target="#xs-controllers-links-module-TravelPlanModule-9d95228dec416f658e5f3bd31c5e5ee592da5b2fdec29b6eb2d1c6aa414619aacadbf2b6578bc272a318616216152e0814f05f81765c8359c3b77b6bde7e87c9"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-TravelPlanModule-9d95228dec416f658e5f3bd31c5e5ee592da5b2fdec29b6eb2d1c6aa414619aacadbf2b6578bc272a318616216152e0814f05f81765c8359c3b77b6bde7e87c9"' :
                                            'id="xs-controllers-links-module-TravelPlanModule-9d95228dec416f658e5f3bd31c5e5ee592da5b2fdec29b6eb2d1c6aa414619aacadbf2b6578bc272a318616216152e0814f05f81765c8359c3b77b6bde7e87c9"' }>
                                            <li class="link">
                                                <a href="controllers/TravelPlanController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TravelPlanController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TravelPlanModule-9d95228dec416f658e5f3bd31c5e5ee592da5b2fdec29b6eb2d1c6aa414619aacadbf2b6578bc272a318616216152e0814f05f81765c8359c3b77b6bde7e87c9"' : 'data-bs-target="#xs-injectables-links-module-TravelPlanModule-9d95228dec416f658e5f3bd31c5e5ee592da5b2fdec29b6eb2d1c6aa414619aacadbf2b6578bc272a318616216152e0814f05f81765c8359c3b77b6bde7e87c9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TravelPlanModule-9d95228dec416f658e5f3bd31c5e5ee592da5b2fdec29b6eb2d1c6aa414619aacadbf2b6578bc272a318616216152e0814f05f81765c8359c3b77b6bde7e87c9"' :
                                        'id="xs-injectables-links-module-TravelPlanModule-9d95228dec416f658e5f3bd31c5e5ee592da5b2fdec29b6eb2d1c6aa414619aacadbf2b6578bc272a318616216152e0814f05f81765c8359c3b77b6bde7e87c9"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TravelPlanIndexService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TravelPlanIndexService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TravelPlanService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TravelPlanService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UserModule.html" data-type="entity-link" >UserModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UserModule-98a7488ec850118638e889cd95e2e9ed2db137c6d74cc59a8c8ca648afd34a439cc8af591ea520c389a4bc4dbebc400e400add30f0b00ad7ee427b5eff61524b"' : 'data-bs-target="#xs-controllers-links-module-UserModule-98a7488ec850118638e889cd95e2e9ed2db137c6d74cc59a8c8ca648afd34a439cc8af591ea520c389a4bc4dbebc400e400add30f0b00ad7ee427b5eff61524b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UserModule-98a7488ec850118638e889cd95e2e9ed2db137c6d74cc59a8c8ca648afd34a439cc8af591ea520c389a4bc4dbebc400e400add30f0b00ad7ee427b5eff61524b"' :
                                            'id="xs-controllers-links-module-UserModule-98a7488ec850118638e889cd95e2e9ed2db137c6d74cc59a8c8ca648afd34a439cc8af591ea520c389a4bc4dbebc400e400add30f0b00ad7ee427b5eff61524b"' }>
                                            <li class="link">
                                                <a href="controllers/UserController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UserModule-98a7488ec850118638e889cd95e2e9ed2db137c6d74cc59a8c8ca648afd34a439cc8af591ea520c389a4bc4dbebc400e400add30f0b00ad7ee427b5eff61524b"' : 'data-bs-target="#xs-injectables-links-module-UserModule-98a7488ec850118638e889cd95e2e9ed2db137c6d74cc59a8c8ca648afd34a439cc8af591ea520c389a4bc4dbebc400e400add30f0b00ad7ee427b5eff61524b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserModule-98a7488ec850118638e889cd95e2e9ed2db137c6d74cc59a8c8ca648afd34a439cc8af591ea520c389a4bc4dbebc400e400add30f0b00ad7ee427b5eff61524b"' :
                                        'id="xs-injectables-links-module-UserModule-98a7488ec850118638e889cd95e2e9ed2db137c6d74cc59a8c8ca648afd34a439cc8af591ea520c389a4bc4dbebc400e400add30f0b00ad7ee427b5eff61524b"' }>
                                        <li class="link">
                                            <a href="injectables/NicknameService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NicknameService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ProfileImageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileImageService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserDeleterService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserDeleterService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserReaderService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserReaderService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserUpdaterService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserUpdaterService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AppController.html" data-type="entity-link" >AppController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DailyPlanController.html" data-type="entity-link" >DailyPlanController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DailyScheduleController.html" data-type="entity-link" >DailyScheduleController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ExpenseController.html" data-type="entity-link" >ExpenseController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/FeedController.html" data-type="entity-link" >FeedController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/MyTripController.html" data-type="entity-link" >MyTripController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/OurTripController.html" data-type="entity-link" >OurTripController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ScrapController.html" data-type="entity-link" >ScrapController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/SearchController.html" data-type="entity-link" >SearchController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/TravelLogController.html" data-type="entity-link" >TravelLogController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/TravelPlanController.html" data-type="entity-link" >TravelPlanController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UserController.html" data-type="entity-link" >UserController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AllExceptionsFilter.html" data-type="entity-link" >AllExceptionsFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateDailyPlanDto.html" data-type="entity-link" >CreateDailyPlanDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateDailyScheduleDto.html" data-type="entity-link" >CreateDailyScheduleDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateDailyScheduleDto-1.html" data-type="entity-link" >CreateDailyScheduleDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatedUserDto.html" data-type="entity-link" >CreatedUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateExpenseDto.html" data-type="entity-link" >CreateExpenseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateFeedDto.html" data-type="entity-link" >CreateFeedDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateScrapDto.html" data-type="entity-link" >CreateScrapDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateTravelPlanDto.html" data-type="entity-link" >CreateTravelPlanDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DailyPlan.html" data-type="entity-link" >DailyPlan</a>
                            </li>
                            <li class="link">
                                <a href="classes/DailySchedule.html" data-type="entity-link" >DailySchedule</a>
                            </li>
                            <li class="link">
                                <a href="classes/DateOrStringValidator.html" data-type="entity-link" >DateOrStringValidator</a>
                            </li>
                            <li class="link">
                                <a href="classes/Expense.html" data-type="entity-link" >Expense</a>
                            </li>
                            <li class="link">
                                <a href="classes/Feed.html" data-type="entity-link" >Feed</a>
                            </li>
                            <li class="link">
                                <a href="classes/FeedSearchUtil.html" data-type="entity-link" >FeedSearchUtil</a>
                            </li>
                            <li class="link">
                                <a href="classes/Login.html" data-type="entity-link" >Login</a>
                            </li>
                            <li class="link">
                                <a href="classes/PostCoverImageDto.html" data-type="entity-link" >PostCoverImageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PostProfileImageDto.html" data-type="entity-link" >PostProfileImageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PutDailyPlanDto.html" data-type="entity-link" >PutDailyPlanDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PutDailyScheduleDto.html" data-type="entity-link" >PutDailyScheduleDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PutExpenseDto.html" data-type="entity-link" >PutExpenseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PutTravelLogImageDto.html" data-type="entity-link" >PutTravelLogImageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PutTravelLogPostContentDto.html" data-type="entity-link" >PutTravelLogPostContentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PutTravelPlanDto.html" data-type="entity-link" >PutTravelPlanDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Scrap.html" data-type="entity-link" >Scrap</a>
                            </li>
                            <li class="link">
                                <a href="classes/SignInDto.html" data-type="entity-link" >SignInDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TravelPlan.html" data-type="entity-link" >TravelPlan</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateFeedDto.html" data-type="entity-link" >UpdateFeedDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserInfoDto.html" data-type="entity-link" >UserInfoDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AppService.html" data-type="entity-link" >AppService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthMiddleware.html" data-type="entity-link" >AuthMiddleware</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DailyPlanService.html" data-type="entity-link" >DailyPlanService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DailyScheduleIndexService.html" data-type="entity-link" >DailyScheduleIndexService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DailyScheduleService.html" data-type="entity-link" >DailyScheduleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExpenseService.html" data-type="entity-link" >ExpenseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FeedExtractor.html" data-type="entity-link" >FeedExtractor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FeedScrapService.html" data-type="entity-link" >FeedScrapService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FeedService.html" data-type="entity-link" >FeedService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileUtilService.html" data-type="entity-link" >FileUtilService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoggerMiddleware.html" data-type="entity-link" >LoggerMiddleware</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MyTripService.html" data-type="entity-link" >MyTripService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NicknameService.html" data-type="entity-link" >NicknameService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OurTripService.html" data-type="entity-link" >OurTripService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PasswordSerializerInterceptor.html" data-type="entity-link" >PasswordSerializerInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProfileImageService.html" data-type="entity-link" >ProfileImageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/S3Service.html" data-type="entity-link" >S3Service</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ScrapService.html" data-type="entity-link" >ScrapService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SearchByAuthorStrategy.html" data-type="entity-link" >SearchByAuthorStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SearchByContentStrategy.html" data-type="entity-link" >SearchByContentStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SearchByTitleStrategy.html" data-type="entity-link" >SearchByTitleStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SearchService.html" data-type="entity-link" >SearchService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SearchStrategyFactory.html" data-type="entity-link" >SearchStrategyFactory</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SlackService.html" data-type="entity-link" >SlackService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TravelLogService.html" data-type="entity-link" >TravelLogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TravelPlanIndexService.html" data-type="entity-link" >TravelPlanIndexService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TravelPlanService.html" data-type="entity-link" >TravelPlanService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserDeleterService.html" data-type="entity-link" >UserDeleterService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserReaderService.html" data-type="entity-link" >UserReaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserUpdaterService.html" data-type="entity-link" >UserUpdaterService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ExtractedFeed.html" data-type="entity-link" >ExtractedFeed</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FeedSearchStrategy.html" data-type="entity-link" >FeedSearchStrategy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/INicknameGenerator.html" data-type="entity-link" >INicknameGenerator</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProfileImageService.html" data-type="entity-link" >IProfileImageService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserDeleter.html" data-type="entity-link" >IUserDeleter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserReader.html" data-type="entity-link" >IUserReader</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserUpdater.html" data-type="entity-link" >IUserUpdater</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginationResult.html" data-type="entity-link" >PaginationResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchParams.html" data-type="entity-link" >SearchParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserDevice.html" data-type="entity-link" >UserDevice</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});