import express from "express"
import morgan from "morgan";
import session from "express-session";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const app = express();
const logger = morgan("dev");

console.log(process.cwd());

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views")
app.use(logger);
app.use(express.urlencoded({extended: true}));
app.use(
    session({
        secret: "Hello!",
        resave: true,
        saveUninitialized: true,
    })
)

app.get("/add-one", (req, res, next) => {
    req.session.potato += 1;
    return res.send(`${req.session.id}\n${req.session.potato}`);
})

app.use((req, res, next) => {
    req.sessionStore.all((error, sessions) => {
      console.log(sessions);
      next();
    });
});
  

app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;