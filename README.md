본 프로젝트는 nomad corder의 유튜브 클론 수업(wetube)을 수강하며 만든 프로젝트입니다.
이 README는 프로그램을 구현하는데 사용된 다양한 기술들을 정리하기 위해서 만들었습니다.
<br>
<br>

# 앱 동작 과정

<br>

## [로컬]

<br>

### 1. 서버 실행

<br>

터미널에 `npm run dev:server` 입력

-> `package.json`의 `script`에 있는 `dev:server` 명령어(내용 : `nodemon`) 실행

-> `nodemon.json`의 `exec` 명령어(내용 : `babel-node src/init.js`) 실행   
(`babel-node` 는 ES6처럼 최신 기법으로 작성된 JS코드를 누구나 다 알아 들을 수 있는 일반 JS로 변환시키는 모듈.)

-> `init.js` 에서 `app.listen(PORT)` 로 PORT번 포트로 로컬 서버 구동   
(`app`은 `server.js`가 만들어논 것을 ``import`` 해옴)

-> `init.js` 가 `db.js`를 `import` 중이므로 `db` 동작

<br>

### 2. Webpack 실행

<br>

터미널에 `npm run dev:assets` 입력

-> `package.json`의 `script`에 있는 `dev:assets` 명령어(내용 : `webpack --mode=production`) 실행   

-> `webpack --mode=development -w` 은 `src의` `client` 폴더에 있는 소스들을 프론트엔드 단에서 동작시킬 수 있게끔 변환시켜 `assets` 폴더에 저장한다. `development` 모드는 개발용으로 소스의 간격을 유지한다.

<br>

---

<br>

## [Heroku]

<br>

Heroku가 `package.json`의 `build` 명령어(내용 : `npm run build:server && npm run build:assets -> `를 찾아서 실행함

-> `npm run build:server` 은 `babel src -d build`을 수행하여 `src` 내의 파일들을 `build` 함

-> `npm run build:assets` 은 `webpack --mode=production`를 수행하여 `src/client/` 내의 파일을 변환시켜 `assets` 폴더에 저장한다. `production` 모드는 배포용으로 소스의 간격을 없앤다.

-> Heroku는 `build` 가 끝나면 `start` 명령어(내용 : `node build/init.js`)를 찾아서 실행함

-> `build`된 파일 중에서 `init.js`를 찾아서 실행한다.

-> `init.js` 에서 `app.listen(PORT)` 로 PORT번 포트로 서버 구동   
(`app`은 `server.js`가 만들어논 것을 ``import`` 해옴)

-> `init.js` 가 `db.js`를 `import` 중이므로 `db` 동작

<br>
<br>

# 소스 코드

<br>

## [server.js]

<br>

```js
const logger = morgan("dev");
```
-> `morgan` : 개발 시 실시간으로 로그를 확인하기 위해 사용하는 모듈

<br>

```js
app.set("view engine", "pug");
```
-> 뷰 엔진으로 `pug` 사용

<br>

```js
app.set("views", process.cwd() + "/src/views");
```
-> `pug` 파일의 경로 지정

<br>

```js
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
```
-> `AWS S3`에 업로드된 파일에 대한 접근 권한 설정

<br>

```js
app.use(express.urlencoded({ extended: true }));
```
-> `x-www-form-urlencoded` 형태의 데이터를 해석할 수 있도록 설정   
(`get`, `post`로 부터 받는 다양한 데이터를 읽으려면 꼭 필요함)

<br>

```js
app.use(express.json());
```
-> `JSON` 형태의 데이터를 해석할 수 있도록 설정
(`string`과 `JSON` 간의 변환을 담당)

<br>

```js
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
```
-> `mongoDB` 연결, `SECRET` 값과 `DB_URL` 값은 `로컬`과 `Heroku`가 각각 갖고 있음

<br>

```js
app.use(flash());
```
-> 앱에 일회성 메시지를 제공하는 `flash-express` 모듈 사용

<br>

```js
app.use(localMiddleware);
```
-> 각종 미들웨어 사용 (밑에서 자세히 설명)

<br>

```js
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
```
-> `express.static` 은 정적 파일을 express에 제공하여, 웹 브라우저 상에서 해당 파일들을 사용할 수 있게끔 해주는 설정이다.   
첫번째 매개변수는 경로를 쉽게 부르는 단축어이고, express.static() 안에 경로는 실제 파일이 존재하는 경로이다.

<br>

```js
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);
```
-> 앱에서 사용되는 각종 라우터를 연결한다.

<br>
<br>

## [middlewares.js]
