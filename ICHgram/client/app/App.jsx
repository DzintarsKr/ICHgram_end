import { Route, Routes, useLocation } from "react-router";
import RequireAuth from "@/components/auth/RequireAuth";
import FeedBackdrop from "@/components/layout/FeedBackdrop";
import Layout from "@/components/layout/Layout";
import Create from "@/pages/Create";
import EditProfile from "@/pages/EditProfile";
import Explore from "@/pages/Explore";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/NotFound";
import Notifications from "@/pages/Notifications";
import PostDetail from "@/pages/PostDetail";
import PostModal from "@/pages/PostModal";
import Profile from "@/pages/Profile";
import Register from "@/pages/Register";
import Reset from "@/pages/Reset";
import ResetPassword from "@/pages/ResetPassword";
import Search from "@/pages/Search";

export default function App() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <Routes location={background ?? location}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Home />} />
          <Route element={<FeedBackdrop />}>
            <Route path="create" element={<Create />} />
            <Route path="search" element={<Search />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
          <Route path="explore" element={<Explore />} />
          <Route path="messages/:userId?" element={<Messages />} />
          <Route path="accounts/edit" element={<EditProfile />} />
          <Route path="posts/:id" element={<PostDetail />} />
          <Route path="profile/:userId" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      {background && (
        <Routes>
          <Route path="posts/:id" element={<PostModal />} />
        </Routes>
      )}
    </>
  );
}
