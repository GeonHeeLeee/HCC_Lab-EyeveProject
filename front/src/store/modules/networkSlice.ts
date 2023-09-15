import {createSlice} from "@reduxjs/toolkit";
import {HttpInterface} from "../../api/http/httpInterface";
import {Http} from "../../api/http/http";
import {Network} from "../types/redux.type";

const initialState: Network = {
  networkInterface: new HttpInterface(new Http()),
}

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {}
});

// export const {} = networkSlice.actions;
export default networkSlice.reducer;