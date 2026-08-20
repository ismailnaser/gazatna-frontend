self.__MIDDLEWARE_MATCHERS = [
  {
    "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!api\\/|media\\/|_next\\/static|_next\\/image|favicon.ico|sw.js|pwa-bootstrap.js|manifest.webmanifest|images\\/|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$).*))(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$",
    "originalSource": "/((?!api/|media/|_next/static|_next/image|favicon.ico|sw.js|pwa-bootstrap.js|manifest.webmanifest|images/|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$).*)"
  }
];self.__MIDDLEWARE_MATCHERS_CB && self.__MIDDLEWARE_MATCHERS_CB()