import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ROUTES } from "../constants/routes";

import Splash from "../pages/Splash/Splash";
import Login from "../pages/Login/Login";
import QuickRegister from "../pages/QuickRegister/QuickRegister";

import Home from "../pages/Home/Home";
import Room from "../pages/Room/Room";
import Notifications from "../pages/Notifications/Notifications";
import Profile from "../pages/Profile/Profile";
import Benefits from "../pages/Benefits/Benefits";
import Premium from "../pages/Premium/Premium";
import Support from "../pages/Support/Support";

import NotFound from "../pages/NotFound/NotFound";
import Privacy from "../pages/Privacy/Privacy";
import About from "../pages/About/About";

import PrivateRoute from "./PrivateRoute";

function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path={ROUTES.SPLASH} element={<Splash />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.QUICK_REGISTER} element={<QuickRegister />} />
        <Route path={ROUTES.PRIVACY} element={<Privacy />} />
        <Route path={ROUTES.ABOUT} element={<About />} />

        {/* ================= PRIVATE ROUTES ================= */}
        <Route element={<PrivateRoute />}>

          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ROOM} element={<Room />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.BENEFITS} element={<Benefits />} />
          <Route path={ROUTES.PREMIUM} element={<Premium />} />
          <Route path={ROUTES.SUPPORT} element={<Support />} />

        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<NotFound />} />

      </Routes>

    </BrowserRouter>

  );

}

export default AppRoutes;