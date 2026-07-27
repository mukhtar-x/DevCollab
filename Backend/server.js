const express = require("express");
const { logger } = require("./utils/reusable.js");
const connectDB = require("./config/db.js");
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const errorMiddleware = require("./middlewares/error.middleware.js");
const cookieParser = require("cookie-parser");
const registerActivityLogListener = require("./listeners/activityLog.listener.js");

//Routes
const authRoutes = require("./Routes/auth.routes.js");
const userRoutes = require("./Routes/user.routes.js");
const projectRoutes = require("./Routes/project.routes.js");
const invitationRoutes = require("./Routes/invitation.routes.js");
const taskRoutes = require("./Routes/task.routes.js");
const commentRoutes = require("./Routes/comment.routes.js");


//CORS Options
const CORSOPTIONS = {
    origin: "http://localhost:5173",
    credentials: true,
};

const PORT = process.env.PORT || 3000;
const DEV = process.env.NODE_ENV == "DEV";

const app = express();

//listener activity loggs
registerActivityLogListener();

//middleares
app.use(express.json())
app.use(express({ urlencoded: true }));
app.use(cors(CORSOPTIONS));
app.use(morgan("dev"));
app.use(cookieParser());


app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/project", projectRoutes);
app.use("/invitation", invitationRoutes);
app.use("/project", taskRoutes);
app.use("/project", commentRoutes);



//health check
app.get("/", (req, res) => {
    res.send("Server Running...!");
});

//error middleware
app.use(errorMiddleware);

connectDB()
    .then(() => {
        require("./config/redis.js");
        app.listen(PORT, "0.0.0.0", () => {
            logger(`Server Initiated at http://localhost:${PORT}`);
        });
    });
