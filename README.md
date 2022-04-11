본 프로젝트는 nomad corder의 유튜브 클론 수업(wetube)을 수강하며 만든 프로젝트입니다.
이 README는 프로그램을 구현하는데 사용된 다양한 기술들을 정리하기 위해서 만들었습니다.

# 앱 동작 과정

## 로컬

### 1. 서버 실행

터미널에 `npm run dev:server` 입력

-> `package.json`의 `script`에 있는 `dev:server` 명령어(내용 : `nodemon`) 실행

-> `nodemon.json`의 `exec` 명령어(내용 : `babel-node src/init.js`) 실행   
(`babel-node` 는 ES6처럼 최신 기법으로 작성된 JS코드를 누구나 다 알아 들을 수 있는 일반 JS로 변환시키는 모듈.)

-> `init.js` 에서 `app.listen(PORT)` 로 PORT번 포트로 로컬 서버 구동   
(`app`은 `server.js`가 만들어논 것을 ``import`` 해옴)

-> `init.js` 가 `db.js`를 `import` 중이므로 `db` 동작

### 2. Webpack 실행

터미널에 `npm run dev:assets` 입력

-> `package.json`의 `script`에 있는 `dev:assets` 명령어(내용 : `webpack --mode=production`) 실행   

-> `webpack --mode=development -w` 은 `src의` `client` 폴더에 있는 소스들을 프론트엔드 단에서 동작시킬 수 있게끔 변환시켜 `assets` 폴더에 저장한다. `development` 모드는 개발용으로 소스의 간격을 유지한다.

---

## Heroku

Heroku가 `package.json`의 `build` 명령어(내용 : `npm run build:server && npm run build:assets -> `를 찾아서 실행함

-> `npm run build:server` 은 `babel src -d build`을 수행하여 `src` 내의 파일들을 `build` 함

-> `npm run build:assets` 은 `webpack --mode=production`를 수행하여 `src/client/` 내의 파일을 변환시켜 `assets` 폴더에 저장한다. `production` 모드는 배포용으로 소스의 간격을 없앤다.

-> Heroku는 `build` 가 끝나면 `start` 명령어(내용 : `node build/init.js`)를 찾아서 실행함

-> `build`된 파일 중에서 `init.js`를 찾아서 실행한다.

-> `init.js` 에서 `app.listen(PORT)` 로 PORT번 포트로 서버 구동   
(`app`은 `server.js`가 만들어논 것을 ``import`` 해옴)

-> `init.js` 가 `db.js`를 `import` 중이므로 `db` 동작


# 소스 코드