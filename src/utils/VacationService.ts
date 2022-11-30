import axios from "axios";
import { VacationModel } from "../model/vacationModel";
import { vacationsStore } from "../Redux/Store";
import appUrl from "./Config";
import { addVacationAction, deleteVacationAction, fetchFollowedVacationsAction, fetchVacationsAction, updateVacationAction } from "../Redux/VacationsState";
class VacationService {
    // Get all vacations from API
    public async getAllVacations(): Promise<VacationModel[]> {
            const response = await axios.get<VacationModel[]>(appUrl.getAllVacation);
            const vacations = response.data;
            return vacations;
      
    }

    // Get all followed vacations:
    public async getAllFollowedVacations(): Promise<VacationModel[]> {
        const response = await axios.get<VacationModel[]>(appUrl.getFollowers);
        const followedVacations = response.data;
        return followedVacations;
    }


    // Get one vacation from API
    public async getOneVacation(id: number): Promise<VacationModel> {
        const response = await axios.get<VacationModel>(appUrl.getOneVacation + id);
        const vacation = response.data;
        vacationsStore.dispatch(addVacationAction(vacation));
        return vacation;
    }


    // Delete vacation from API
    public async deleteVacation(id: number): Promise<void> {
        await axios.delete(appUrl.deleteVacation + id);
        vacationsStore.dispatch(deleteVacationAction(id));
    }
}

const vacationsService = new VacationService();

export default vacationsService;