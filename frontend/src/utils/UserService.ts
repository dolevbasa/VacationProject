import axios from "axios";
import { resolve } from "path";
import Role from "../model/Role";
import UserModel from "../model/userModel";
import UsersModel from "../model/usersModel";
//import { UserModel } from "../model/userModel";
import { VacationModel } from "../model/vacationModel";
import { loginAction, logoutAction, registerAction } from "../Redux/AuthState";
import { store, vacationsStore } from "../Redux/Store";
import { addVacationAction, updateVacationAction } from "../Redux/VacationsState";
import appUrl from "./Config";

class GroupService{
    public isAdmin(): boolean {
        const user = store.getState().user;
        if (user) {
            const role = user.is_admin;
            if (role === Role.Admin) return true;
            if (role === Role.User) return false;
        }
        return false;
    }

    public async getAllVacation():Promise<VacationModel[]>{
        const response = await axios.get<VacationModel[]>(appUrl.getAllVacation);
        return response.data;
    }

    public isLoggedIn(): boolean {
        return store.getState().user !== null;
    }

    public logout(): void {
        store.dispatch(logoutAction());
    }

    public async LoginUser(user:UserModel){
        const response = await axios.post<string>(appUrl.loginUser,user);
        const users = response.data;
        store.dispatch(loginAction(users));
    }
    
    public async addUser(user:UserModel):Promise<void>{
        const response = await axios.post<string>(appUrl.addUser,user);
        const token = response.data;
        store.dispatch(registerAction(token));
    }

    public async getAllUsers():Promise<UserModel[]>{
        const response = await axios.get<UserModel[]>(appUrl.users);
        return response.data;
    }

    public async addVacation(vacation:VacationModel):Promise<void>{
        return new Promise((resolve, reject) => {
        const file = vacation.image[0] as unknown as File;
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            const image = reader.result;
            axios.post<VacationModel>(appUrl.addVacation,{...vacation, image}).then(() => resolve());
            vacationsStore.dispatch(addVacationAction(vacation));
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    });
    }
    public async updateVacation(vacation:VacationModel):Promise<void>{
        return new Promise((resolve, reject) => {
            const file = vacation.image[0] as unknown as File;
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                const image = reader.result;
                axios.put<VacationModel>(appUrl.updateVacation + vacation.id,{...vacation, image}).then(()=>resolve());
                vacationsStore.dispatch(updateVacationAction(vacation));
            };
            reader.onerror = function(error){
                console.log('Error: ',error);
            };
        });
    }

}

const groupService = new GroupService();
export default groupService;