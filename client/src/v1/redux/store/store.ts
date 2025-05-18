import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import counterReducer from "../slice/counter.slice.ts";
import createSagaMiddleware from "redux-saga";
import RootSaga from "../saga/root.saga.ts";
import userReducer from "../slice/user.slice.ts";
import filterItemCheckboxSlice from "../slice/filterItemCheckbox.slice.ts";
import courseReducer from "../slice/course.slice.ts";
import categoryReducer from "../slice/category.slice.ts";
import registrationReducer from "../slice/registration.slice.ts";
import adminPageRegistrationReducer from "../slice/admin-registration.slice.ts";
import accountantPageRegistrationReducer from "../slice/accountant-registration.slice.ts"
const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    filter: filterItemCheckboxSlice,
    courses: courseReducer,
    category: categoryReducer,
    registration: registrationReducer,
    adminRegistration: adminPageRegistrationReducer,
    accountantRegistration: accountantPageRegistrationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});
sagaMiddleware.run(RootSaga);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
