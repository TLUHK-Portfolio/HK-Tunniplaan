import SideModal from "../UI/Modal/SideModal";
import { useState } from "react";

const MobileMenu = (props) => {
  const [showUserOptions, setShowUserOptions] = useState(false);
  const { onUsersManagement, admin, onClose } = props;

  const loginHandler = () => {
    setShowUserOptions(true);
  };

  const userRollHandler = (e) => {
    setShowUserOptions(false);
    props.userRollHandler(e);
    onClose();
  };

  const usersManagementHandler = () => {
    onUsersManagement();
    onClose();
  };

  return (
    <SideModal onHidden={props.showMobileMenu}>
      <div className={`flex flex-col`}>
        <div className="px-4 pt-8">
          {!showUserOptions && (
            <div className="flex flex-col space-y-8 w-full pb-10">
              {/* User photo */}
              <div className="mx-auto w-24 h-24">
                <img
                  src={props.userInfo}
                  alt="User"
                  className="w-full h-full rounded-full object-cover
            "
                ></img>
              </div>
              <p className="uppercase text-center">
                {props.loginInfo?.user?.firstName
                  ? props.loginInfo?.user?.firstName
                  : "Logi sisse"}{" "}
                / {props.userRoll ? props.userRoll : "Külaline"}
              </p>

              {!localStorage.getItem("token") && (
                <button
                  onClick={props.login}
                  className="btn-m-menu"
                  className="btn-m-menu"
                  type="button"
                  name="Logout Google"
                >
                  LOGI VÄLJA
                </button>
              )}
              {admin && (
                <button
                  onClick={usersManagementHandler}
                  className="btn-m-menu"
                  type="button"
                  name="userManagement"
                >
                  KASUTAJATE HALDUS
                </button>
              )}
{/* 
              {!localStorage.getItem("token") &&
                props.userRoll !== "LOGI SISSE" && (
                  <button
                    onClick={userRollHandler}
                    type="button"
                    name="logout"
                    className="btn-m-menu"
                  >
                    Logi välja (mock)
                  </button>
                )}
              <button
                onClick={userRollHandler}
                type="button"
                name="admin"
                className="btn-m-menu"
              >
                Haldus (mock)
              </button>
              <button
                onClick={userRollHandler}
                type="button"
                name="lecturer"
                className="btn-m-menu"
              >
                Õppejõud (mock)
              </button>
              <button
                onClick={userRollHandler}
                type="button"
                name="student"
                className="btn-m-menu"
              >
                Õpilane (mock)
              </button> */}
              <a
                className="btn-m-menu text-center"
                target="_blank"
                rel="noopener noreferrer"
                href="https://start.hk.tlu.ee/sahtelbeta/sahtel/index.php"
              >
                Sahtel
              </a>
              <a
                className="btn-m-menu text-center"
                target="_blank"
                rel="noopener noreferrer"
                href="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              >
                Riiul
              </a>
            </div>
          )}
        </div>
      </div>
    </SideModal>
  );
};

export default MobileMenu;
