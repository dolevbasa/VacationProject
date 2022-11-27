import { vacationsStore, store, followStore } from "../../../Redux/Store";
import "./VacationList.css";
import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { fetchFollowedVacationsAction, fetchVacationsAction } from "../../../Redux/VacationsState";
import { VacationModel } from "../../../model/vacationModel";
import vacationsService from "../../../utils/VacationService";
import notify from "../../../utils/Notify";
import Home from "../../Layout/Home/Home";
import Loading from "../../Loading/Loading";



function VacationsList(): JSX.Element {
    const [vacations, setVacations] = useState<VacationModel[]>([]);
    const user = store.getState().user;

    useEffect((async () => {
        try {
            // get vacations from redux
            let vacations = vacationsStore.getState().vacations;
            // if redux vacations is empty, get them from the server
            if (vacations.length === 0) {
                vacations = await vacationsService.getAllVacations();
                vacationsStore.dispatch(fetchVacationsAction(vacations));
            }

            // get user follows from redux
            let userFollows = vacationsStore.getState().followedVacations;
            // if redux follows is empty, get them from the server
            if (userFollows.length === 0) {
                userFollows = await vacationsService.getAllFollowedVacations();
                vacationsStore.dispatch(fetchFollowedVacationsAction(userFollows));
            }

            vacations.sort(v => userFollows.find(f => f.id === v.id) ? -1 : 1);
            // Change the state
            setVacations(vacations);

            // Listen to vacations changes
            const unsubscribe = vacationsStore.subscribe(async () => {
                vacations = await vacationsService.getAllVacations();
                userFollows = vacationsStore.getState().followedVacations;
                vacations.sort(v => userFollows.find(f => f.id === v.id) ? -1 : 1);
                setVacations(vacations);
            });

            return unsubscribe;

        }
        catch (err: any) {
            notify.error(err.message);
        }
    }) as any, [])


    return (
        <div className="VacationsList">
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {vacations ? vacations.map(v =>
                    <Grid item xs={2} sm={4} md={3} key={v.id}>
                        <Home key={v.destination} vacation={v} user={user} />
                    </Grid>) : <Loading />}
            </Grid>
        </div>
    );
}

export default VacationsList;
