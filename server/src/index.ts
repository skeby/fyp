import "module-alias/register";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dbConnect } from "./config/mongo.config";
import authRouter from "./routers/auth.router";
import courseRouter from "./routers/course.router";
import userRouter from "./routers/user.router";
// import crypto from "crypto";
import logger from "./helpers/logger";
import badgeRouter from "./routers/badge.router";
import User from "./models/user";

dotenv.config();
dbConnect("adaptlearn");
const app = express();

app.use(express.json());
app.use(cors());
// Middleware to log all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get("/", async (_, res) => {
  const users = [
    {
      first_name: "Confidence",
      last_name: "Chiabuotu",
      email: "Confidence.Chiabuotu@stu.cu.edu.ng",
      matric_number: "21CG029840",
    },
    {
      first_name: "David",
      last_name: "Unokiwedi",
      email: "David.Unokiwedi@stu.cu.edu.ng",
      matric_number: "21CG029929",
    },
    {
      first_name: "Kingdavid",
      last_name: "Anjorin",
      email: "Kingdavid.Anjorin@stu.cu.edu.ng",
      matric_number: "21CG029827",
    },
    {
      first_name: "Oluwafimidaraayo",
      last_name: "Ayodele",
      email: "Oluwafimidaraayo.Ayodele@stu.cu.edu.ng",
      matric_number: "21CG029832",
    },
    {
      first_name: "Wisdom",
      last_name: "Iyamu",
      email: "Wisdom.Iyamu@stu.cu.edu.ng",
      matric_number: "21CG029866",
    },
    {
      first_name: "Ibukunoluwa",
      last_name: "Kayode",
      email: "Ibukunoluwa.Kayode@stu.cu.edu.ng",
      matric_number: "21CG029868",
    },
    {
      first_name: "Tolulope",
      last_name: "Obasan",
      email: "Tolulope.Obasan@stu.cu.edu.ng",
      matric_number: "21CG029879",
    },
    {
      first_name: "Dolapo",
      last_name: "Ajibola",
      email: "Dolapo.Ajibola@stu.cu.edu.ng",
      matric_number: "21CG029817",
    },
    {
      first_name: "Uchenna",
      last_name: "Chukwu",
      email: "Uchenna.Chukwu@stu.cu.edu.ng",
      matric_number: "21CG029841",
    },
    {
      first_name: "Chinedu",
      last_name: "Ndulue",
      email: "Chinedu.Ndulue@stu.cu.edu.ng",
      matric_number: "21CG029873",
    },
    {
      first_name: "Oluwakorede",
      last_name: "Oguntuyo",
      email: "Oluwakorede.Oguntuyo@stu.cu.edu.ng",
      matric_number: "21CG029887",
    },
    {
      first_name: "Samuel",
      last_name: "Ohiani",
      email: "Samuel.Ohiani@stu.cu.edu.ng",
      matric_number: "21CG029888",
    },
    {
      first_name: "Gbekeloluwa",
      last_name: "Oyemakinde",
      email: "Gbekeloluwa.Oyemakinde@stu.cu.edu.ng",
      matric_number: "21CG029918",
    },
    {
      first_name: "Iseoluwa",
      last_name: "Afolayan",
      email: "Iseoluwa.Afolayan@stu.cu.edu.ng",
      matric_number: "21CG029813",
    },
    {
      first_name: "Mark-Morris",
      last_name: "Ikeagbo",
      email: "Mark-Morris.Ikeagbo@stu.cu.edu.ng",
      matric_number: "21CE030127",
    },
    {
      first_name: "Adebola",
      last_name: "Odufuwa",
      email: "Adebola.Odufuwa@stu.cu.edu.ng",
      matric_number: "21CG029882",
    },
    {
      first_name: "Opeoluwa",
      last_name: "Ogunfeitimi",
      email: "Opeoluwa.Ogunfeitimi@stu.cu.edu.ng",
      matric_number: "21CG029886",
    },
    {
      first_name: "David",
      last_name: "Oratokhai",
      email: "David.Oratokhai@stu.cu.edu.ng",
      matric_number: "21CG029910",
    },
    {
      first_name: "Olawande",
      last_name: "Teniola",
      email: "Olawande.Teniola@stu.cu.edu.ng",
      matric_number: "21CG029926",
    },
    {
      first_name: "Kelvin",
      last_name: "Areola",
      email: "Kelvin.Areola@stu.cu.edu.ng",
      matric_number: "21CG029830",
    },
    {
      first_name: "Oluwatobi",
      last_name: "Moshood",
      email: "Oluwatobi.Moshood@stu.cu.edu.ng",
      matric_number: "21CG029872",
    },
    {
      first_name: "Emmanuel",
      last_name: "Okaka",
      email: "Emmanuel.Okaka@stu.cu.edu.ng",
      matric_number: "21CG029891",
    },
    {
      first_name: "Jeffrey",
      last_name: "Onyibe",
      email: "Jeffrey.Onyibe@stu.cu.edu.ng",
      matric_number: "21CG029909",
    },
    {
      first_name: "Emmanuel",
      last_name: "Ozegbe",
      email: "Emmanuel.Ozegbe@stu.cu.edu.ng",
      matric_number: "21CD030096",
    },
    {
      first_name: "Henry",
      last_name: "Taiwo",
      email: "Henry.Taiwo@stu.cu.edu.ng",
      matric_number: "21CG029925",
    },
    {
      first_name: "Stephen",
      last_name: "Agbenin",
      email: "Stephen.Agbenin@stu.cu.edu.ng",
      matric_number: "21CG029814",
    },
    {
      first_name: "Joel",
      last_name: "Anitor",
      email: "Joel.Anitor@stu.cu.edu.ng",
      matric_number: "21CG029826",
    },
    {
      first_name: "David",
      last_name: "Aogo",
      email: "David.Aogo@stu.cu.edu.ng",
      matric_number: "21CG029829",
    },
    {
      first_name: "Bruno",
      last_name: "Nweremizu",
      email: "Bruno.Nweremizu@stu.cu.edu.ng",
      matric_number: "21CG029876",
    },
    {
      first_name: "Samuel",
      last_name: "Okonkwo",
      email: "Samuel.Okonkwo@stu.cu.edu.ng",
      matric_number: "21CG029896",
    },
    {
      first_name: "Oluwasanmi",
      last_name: "Adewumi",
      email: "Oluwasanmi.Adewumi@stu.cu.edu.ng",
      matric_number: "21CG029809",
    },
    {
      first_name: "Jason",
      last_name: "Aghedo",
      email: "Jason.Aghedo@stu.cu.edu.ng",
      matric_number: "21CG029815",
    },
    {
      first_name: "Divine",
      last_name: "Ekong",
      email: "Divine.Ekong@stu.cu.edu.ng",
      matric_number: "21CG029848",
    },
    {
      first_name: "Isaac",
      last_name: "Oluwakoya",
      email: "Isaac.Oluwakoya@stu.cu.edu.ng",
      matric_number: "21CG029903",
    },
    {
      first_name: "Ireoluwawolede",
      last_name: "Badaki",
      email: "Ireoluwawolede.Badaki@stu.cu.edu.ng",
      matric_number: "21CG029834",
    },
    {
      first_name: "Tisloh",
      last_name: "Bot",
      email: "Tisloh.Bot@stu.cu.edu.ng",
      matric_number: "21CG029838",
    },
    {
      first_name: "Mishael",
      last_name: "Daniel",
      email: "Mishael.Daniel@stu.cu.edu.ng",
      matric_number: "21CG029842",
    },
    {
      first_name: "Ronald",
      last_name: "Dosunmu",
      email: "Ronald.Dosunmu@stu.cu.edu.ng",
      matric_number: "21CG029843",
    },
    {
      first_name: "Chidubem",
      last_name: "Ezenwere",
      email: "Chidubem.Ezenwere@stu.cu.edu.ng",
      matric_number: "21CG029853",
    },
    {
      first_name: "Tumininu",
      last_name: "Ijimakinwa",
      email: "Tumininu.Ijimakinwa@stu.cu.edu.ng",
      matric_number: "21CG029863",
    },
    {
      first_name: "Isaac",
      last_name: "Ime",
      email: "Isaac.Ime@stu.cu.edu.ng",
      matric_number: "21CG029865",
    },
    {
      first_name: "Daniel",
      last_name: "Ogbeide",
      email: "Daniel.Ogbeide@stu.cu.edu.ng",
      matric_number: "21CG029883",
    },
    {
      first_name: "Gideon",
      last_name: "Ogordi",
      email: "Gideon.Ogordi@stu.cu.edu.ng",
      matric_number: "21CG029884",
    },
    {
      first_name: "Emmanuel",
      last_name: "Oke",
      email: "Emmanuel.Oke@stu.cu.edu.ng",
      matric_number: "21CG029892",
    },
    {
      first_name: "Olasubomi",
      last_name: "Otusanya",
      email: "Olasubomi.Otusanya@stu.cu.edu.ng",
      matric_number: "21CG029913",
    },
    {
      first_name: "Temidire",
      last_name: "Owoeye",
      email: "Temidire.Owoeye@stu.cu.edu.ng",
      matric_number: "21CG029914",
    },
    {
      first_name: "Daniel",
      last_name: "Owolabi",
      email: "Daniel.Owolabi@stu.cu.edu.ng",
      matric_number: "21CG029915",
    },
    {
      first_name: "Joseph",
      last_name: "Abhulimen",
      email: "Joseph.Abhulimen@stu.cu.edu.ng",
      matric_number: "21CG029800",
    },
    {
      first_name: "Philip",
      last_name: "Adebayo",
      email: "Philip.Adebayo@stu.cu.edu.ng",
      matric_number: "21CG029802",
    },
    {
      first_name: "David",
      last_name: "Okonkwo",
      email: "David.Okonkwo@stu.cu.edu.ng",
      matric_number: "21CG029895",
    },
    {
      first_name: "Tega",
      last_name: "Akpojiyovwi",
      email: "Tega.Akpojiyovwi@stu.cu.edu.ng",
      matric_number: "21CG029821",
    },
  ].map((u) => ({
    ...u,
    email: u.email.toLowerCase(),
    username: `${u.first_name}-${u.last_name}`,
    password: "1P@ssword",
  }));
  res.status(200).json({
    status: "success",
    message: "Welcome to the backend service of AdaptLearn",
  });
});

app.use("/auth", authRouter);
app.use("/course", courseRouter);
app.use("/user", userRouter);
app.use("/badge", badgeRouter);

const startServer = async () => {
  const port = process.env.PORT;
  try {
    app.listen(port, () => {
      console.log(`Server running on port ${port || 2000}`);
      // console.log(crypto.randomBytes(32).toString("hex")); // Random bytes for secrets
    });
    // Authenticate mongodb
  } catch (err) {
    console.error("Error launching server", err);
  }
};

startServer();
