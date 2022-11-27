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
        const response = await axios.get<VacationModel[]>(appUrl.getAllVacation);
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

    // Add vacation to API
    public async addVacation(vacation: VacationModel): Promise<VacationModel> {
        const myFromData = new FormData();
        myFromData.append("destination", vacation.destination);
        myFromData.append("description", vacation.description);
        myFromData.append("price", vacation.price.toString());
        myFromData.append("from_date", vacation.from_date.toString());
        myFromData.append("to_date", vacation.to_date.toString());
        myFromData.append("image", vacation.image);
        const response = await axios.post<VacationModel>(appUrl.addVacation, myFromData);
        const addedVacation = response.data;
        vacationsStore.dispatch(addVacationAction(addedVacation));
        return addedVacation;
    }

    // Update vacation in API
    public async updateVacation(vacation: VacationModel): Promise<VacationModel> {
        const myFromData = new FormData();
        myFromData.append("destination", vacation.destination);
        myFromData.append("description", vacation.description);
        myFromData.append("image", vacation.image);
        myFromData.append("vacationPrice", vacation.price.toString());
        myFromData.append("from_date", vacation.from_date.toString());
        myFromData.append("to_date", vacation.to_date.toString());
        const response = await axios.patch<VacationModel>(appUrl.updateVacation + vacation.id, myFromData);
        const updatedVacation = response.data;
        vacationsStore.dispatch(updateVacationAction(updatedVacation));
        return updatedVacation;
    }

    // Delete vacation from API
    public async deleteVacation(id: number): Promise<void> {
        await axios.delete(appUrl.deleteVacation + id);
        vacationsStore.dispatch(deleteVacationAction(id));
    }
}

const vacationsService = new VacationService();

export default vacationsService;