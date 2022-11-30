import { UserModel } from '../model/user';
import { VacationModel } from '../model/vacation'
import dal from '../utils/dal_mysql';
import { v4 as uuid } from "uuid";
import { OkPacket } from 'mysql';
import { SavedModel } from '../model/savedVacation';
import ClientError from '../model/client-errors';
import jwt from '../utils/jwt';
import Role from '../model/Role';
import socket from '../utils/socket';
import socketLogics from './socket-logics';
// users
async function getAllUsers(): Promise<UserModel[]> {
  const sql = `SELECT * FROM vacations.user;`;
  const result = await dal.execute(sql);
  return result;
}
// login
async function login(userLogin: UserModel):Promise<string> {
  const sql = `SELECT * FROM vacations.user WHERE user_name = '${userLogin.user_name}' and user_password='${userLogin.user_password}';`;
  const users = await dal.execute(sql);
  const user = users[0];

  if (!user) throw new ClientError(401, "Incorrect username or password");

    delete user.password;

    const token = jwt.getNewToken(user);

    return token;
};
// register
async function addUser(user: UserModel){

  const dbUsers = getAllUsers();
  const userInDb = (await dbUsers).find(u=> u.user_name === user.user_name);
  if(userInDb) throw new ClientError(401,"This Username Already exists!")
  const sql = `
  INSERT INTO vacations.user VALUES (DEFAULT,'${user.first_name}', '${user.last_name}', '${user.user_name}', '${user.user_password}',${user.is_admin = Role.User});
  `;
  const info: OkPacket = await dal.execute(sql);
    user.id = info.insertId;
    delete user.user_password;
    const token = jwt.getNewToken(user);
    return token;
};
//id,description,destination,from_date,to_date,price,followers,CONVERT(image USING utf8) as image
// vacations
async function getAllVacations(): Promise<UserModel[]> {
  const sql = `SELECT id, destination, 
              DATE_FORMAT(from_date, "%d-%m-%Y") AS from_date, 
              DATE_FORMAT(to_date, "%d-%m-%Y") AS to_date, description, CONVERT(image USING utf8) as image, followers, price from vacations.vacation`;
  const vacations = await dal.execute(sql);
  return vacations;
};

async function getOneVacation(id: number) {
  const sql = `SELECT * FROM vacation WHERE id = ${id}`;
  const result = await dal.execute(sql);
  return result;
};

async function followVacation(data: SavedModel): Promise<SavedModel> {
  const sql = `INSERT INTO savedvacations(user_ID,vacation_ID)
  VALUES(${data.user_ID} ,${data.vacation_ID})`;
  const vacation = await dal.execute(sql);
  return vacation;
}

async function getFollowedVacations(id:number): Promise<SavedModel> {
  const sql = `SELECT vacationId FROM savedvacations 
WHERE userId = ${id}`;
  const vacations = await dal.execute(sql);
  return vacations;
}

async function deleteFollowedVacation(userId: number, vacationId: number):Promise<void> {
  const sql = `DELETE FROM savedvacations WHERE userId = ${userId} and vacationId = ${vacationId}`;
  await dal.execute(sql);
}

async function addNewVacation(vacation: VacationModel): Promise<VacationModel>{
  
  const sql = `INSERT INTO vacations.vacation VALUES(DEFAULT,
      '${vacation.description}',
      '${vacation.destination}',
      '${vacation.image}',
      '${vacation.from_date}',
      '${vacation.to_date}',
      ${vacation.price},
      0,0);`;
    const result: OkPacket = await dal.execute(sql);
    vacation.id = result.insertId;
    return vacation;
}

async function deleteVacation(id: number): Promise<void> {
  const sql = `DELETE FROM vacations.vacation WHERE id = ${id}`;
  await dal.execute(sql);
}

async function updateFullVacation(vacation: VacationModel): Promise<VacationModel> {
  // Validate put
  // if user sent an image

  const sql = `UPDATE vacations.vacation SET
              destination = '${vacation.destination}',
              description = '${vacation.description}',
              image = '${vacation.image}',
              from_date = '${vacation.from_date}',
              to_date = '${vacation.to_date}',
              price = ${vacation.price}
              WHERE id = ${vacation.id}`;
  const info: OkPacket = await dal.execute(sql);
  vacation.id = info.insertId;
  return vacation;
}

async function getAllFollowedVacations():Promise<SavedModel>{
  const sql = 'SELECT * FROM savedvacations';
  const vacations = await dal.execute(sql);
  return vacations;
}
// Add follow vacation
async function addFollow(vacationToFollow: SavedModel): Promise<SavedModel> {
  const sql = `INSERT INTO savedvacations VALUES(${vacationToFollow.user_ID}, ${vacationToFollow.vacation_ID})`;
  const result: OkPacket = await dal.execute(sql);

  // update +1 to followers in vacations table
  const sqlVacationsTable = `UPDATE vacations.vacation 
                          SET followers = followers + 1 
                          WHERE id = ${vacationToFollow.vacation_ID}`;
  const info: OkPacket = await dal.execute(sqlVacationsTable);
  socketLogics.emitAddFollow(vacationToFollow);
  return vacationToFollow;
}

// Remove follow 
async function removeFollow(follow: SavedModel): Promise<void> {
  // remove follower from followers table
  const sqlFollowerTable = `DELETE FROM savedvacations 
    WHERE vacation_ID=${follow.vacation_ID} 
    AND user_ID=${follow.user_ID}`;
  const results: OkPacket = await dal.execute(sqlFollowerTable);
  // update -1 to followers in vacations table
  const sqlVacationsTable = `UPDATE vacations.vacation 
                              SET followers = followers - 1 
                              WHERE id = ${follow.vacation_ID}`;
  const info: OkPacket = await dal.execute(sqlVacationsTable);
  socketLogics.emitRemoveFollow(follow);
}

export default {
  login,
  addUser,
  getAllUsers,
  getAllVacations,
  getOneVacation,
  addNewVacation,
  followVacation,
  getFollowedVacations,
  deleteFollowedVacation,
  deleteVacation,
  updateFullVacation,
  removeFollow,
  addFollow,
  getAllFollowedVacations
}