import React, { useState, useEffect, useCallback } from "react";
import useAxios from "../hooks/useAxios";

import * as dateService from "../utils/Format/Date";

import ScheduleFilters from "./views/ScheduleFilters";
import ScheduleAddition from "./views/ScheduleAddition";
import Table from "./views/scheduleTable/Table";
import GoTopButton from "./UI/Button/GoTopButton";
import MobileMenu from "./views/MobileMenu";
import { Spinner } from "./UI/Spinner";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useRef } from "react";
import { AddScheduleButton } from "./UI/Button/AddScheduleButton";
import { addDays, subDays } from "date-fns";
import { Header } from "./views/Header";
import { useMediaQuery } from "react-responsive";
import UsersList from "./views/UsersList";
import { RequestError } from "./UI/RequestError";

const Home = () => {
  const [scheduleRequestParams, setScheduleRequestParams] = useState({
    startDate: new Date().toISOString(),
    endDate: ""
  });
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [newOccurenceAdded, setNewOccurenceAdded] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [hasServerError, setHasServerError] = useState(undefined);

  // const [loginInfo, setLoginInfo] = useState(null); // Sisselogitud kasutaja intentifitseerimiseks backis.

  let [loginInfo, setLoginInfo] = useState(() => {
    let token = localStorage.getItem("token");
    if (token === {}) {
      return null;
    }

    return token ? JSON.parse(token) : {};
  });

  const { response, isLoading, error } = useAxios(
    {
      method: "get",
      url: `/schedule/${scheduleRequestParams?.startDate}/${scheduleRequestParams?.endDate}`,
      headers: { Authorization: `Bearer ${loginInfo?.token}` },
    },
    newOccurenceAdded
  );

  const [dropdownsSelection, setDropdownSelection] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [userLecturer, setUserLecturer] = useState(false);
  const [userStudent, setUserStudent] = useState(false);
  const [addSchedule, setAddSchedule] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [notScheduled, setNotScheduled] = useState("");
  const filtersRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [hiddeMobileFilters, setHiddeMobileFilters] = useState(false);
  const [openModalAnimation, setOpenModalAnimation] = useState(false);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1023px)" });
  const [showUsersList, setShowUsersList] = useState(false);

  const work_Data = useCallback(() => {
    setScheduleLoading(isLoading);
    setHasServerError(error?.message ? error.message : undefined);

    if (!isLoading && response !== undefined) {
      let schedule = response.schedule;
      schedule.forEach(function (o) {
        Object.keys(o).forEach(function (k) {
          if (o[k] === null) {
            o[k] = "";
          }
        });
      });
      setData(schedule);
      setFilteredData(schedule);
    }
  }, [isLoading, response, error]);

  useEffect(() => {
    work_Data();
  }, [work_Data]);

  const dropdownController = (data, obj) => {
    let filteredObj = data.filter(
      (e) => e[obj.flatMap(Object.keys)[0]] === undefined
    );
    if (
      obj[0].value === "courseCode" ||
      obj[0].value === "subject" ||
      obj[0].value === "lecturer" ||
      obj[0].value === "room"
    ) {
      return [...data.filter((e) => e[obj[0].value] === undefined)];
    }
    return [...obj, ...filteredObj];
  };

  const scheduleFilter = (filterObj, rawData, type) => {
    let filterType;
    if (type === "courses") filterType = "courseCode";
    else if (type === "lecturers") filterType = "lecturer";
    else if (type === "rooms") filterType = "room";
    else {
      filterType = type;
    }
    let filteredObjects = filterObj.filter((e) => e[filterType]);
    let objectKeys = filteredObjects.flatMap(Object.keys);
    let objectValues = filteredObjects.flatMap(Object.values);
    let filteredeData = [];
    if (type === "courses") {
      for (let i = 0; i < objectValues.length; i++) {
        filteredeData.push(
          ...rawData.filter((e) => {
            if (e.courses) {
              return e.courses
                .flatMap(Object.values)
                .some((el) => el === objectValues[i]);
            }
            return false;
          })
        );
      }
    }
    if (type === "lecturers") {
      for (let i = 0; i < objectValues.length; i++) {
        filteredeData.push(
          ...rawData.filter((e) => {
            if (e.lecturers) {
              let fullName = e.lecturers.map(
                (e) => `${e.firstName} ${e.lastName}`
              );
              return fullName.some((el) => el === objectValues[i]);
            }
            return false;
          })
        );
      }
    }
    if (type === "rooms") {
      for (let i = 0; i < objectValues.length; i++) {
        filteredeData.push(
          ...rawData.filter((e) => {
            if (e.rooms) {
              return e.rooms
                .flatMap(Object.values)
                .some((el) => el === objectValues[i]);
            }
            return false;
          })
        );
      }
    }
    if (type === "subject") {
      for (let i = 0; i < objectValues.length; i++) {
        filteredeData.push(
          ...rawData.filter(
            (e) => e.subject[objectKeys[i]].trim() === objectValues[i]
          )
        );
      }
    }

    if (filterType === "startTime") {
      const reverseDate = (str) => {
        return str.split(".").reverse().join("-");
      };
      filteredeData.push(
        ...rawData.filter((e) => {
          let time1 = dateService.formatMilliseconds(
            reverseDate(dateService.formatDate(e[objectKeys[0]]))
          );
          let time2 = dateService.formatMilliseconds(
            reverseDate(dateService.formatDate(objectValues[0]))
          );
          let time3 = dateService.formatMilliseconds(
            reverseDate(dateService.formatDate(objectValues[1]))
          );
          return time1 >= time2 && time1 <= time3;
        })
      );
    }

    filteredeData = filteredeData.filter(
      (value, index, self) => index === self.findIndex((t) => t.id === value.id)
    );

    return filteredeData;
  };

  const dataFilterHandler = (dropdownValues) => {
    if (dropdownValues[0]?.startTime && dropdownValues[0]?.endTime) {
      setScheduleRequestParams({
        startDate: new Date(dropdownValues[0].startTime).toISOString(),
        endDate: new Date(dropdownValues[0]?.endTime).toISOString(),
      });

      setNewOccurenceAdded((prevState) => (prevState = !prevState));
    }
    setDropdownSelection((prevState) => {
      return [...dropdownController(prevState === undefined ? [] : prevState, dropdownValues)];
    });
  };

  useEffect(() => {
    if(!dropdownsSelection) {
      return;
    }

    const hasStartTime = dropdownsSelection.find((o) => o.startTime);
    const hasCourse = dropdownsSelection.find((o) => o.courseCode);
    const hasSubject = dropdownsSelection.find((o) => o.subject);
    const hasLecturer = dropdownsSelection.find((o) => o.lecturer);
    const hasRoom = dropdownsSelection.find((o) => o.room);
    if (hasCourse) {
      setFilteredData([...scheduleFilter(dropdownsSelection, data, "courses")]);
    }
    if (hasSubject) {
      setFilteredData((prevState) => {
        return [
          ...scheduleFilter(
            dropdownsSelection,
            hasCourse ? prevState : data,
            "subject"
          ),
        ];
      });
    }
    if (hasLecturer) {
      setFilteredData((prevState) => {
        return [
          ...scheduleFilter(
            dropdownsSelection,
            hasCourse || hasSubject ? prevState : data,
            "lecturers"
          ),
        ];
      });
    }
    if (hasRoom) {
      setFilteredData((prevState) => {
        return [
          ...scheduleFilter(
            dropdownsSelection,
            hasCourse || hasLecturer || hasSubject ? prevState : data,
            "rooms"
          ),
        ];
      });
    }
    if (hasStartTime) {
      setFilteredData((prevState) => {
        return [
          ...scheduleFilter(
            dropdownsSelection,
            hasCourse || hasLecturer || hasSubject || hasRoom
              ? prevState
              : data,
            "startTime"
          ),
        ];
      });
    }
    if (dropdownsSelection.length === 0) {
      setFilteredData([...data]);
    }
  }, [data, dropdownsSelection]);

  filteredData.sort(
    (objA, objB) =>
      Number(new Date(objA.startTime)) - Number(new Date(objB.startTime))
  );

  const userRollHandler = (event) => {
    event.preventDefault();
    if (event.target.name === "admin") {
      setAdmin(true);
      setUserStudent(false);
      setUserLecturer(false);
    }
    if (event.target.name === "lecturer") {
      setAdmin(false);
      setUserStudent(false);
      setUserLecturer(true);
    }
    if (event.target.name === "student") {
      setAdmin(false);
      setUserLecturer(false);
      setUserStudent(true);
    }
    if (event.target.name === "logout") {
      setAdmin(false);
      setUserLecturer(false);
      setUserStudent(false);
      setShowUsersList(false);
    }
    setShowUsersModal(false);
  };

  const userAdminHandler = (event) => {
    setShowUsersModal(false);
  };

  useEffect(() => {
    const roles = {
      admin: false,
      userLecturer: false,
      userStudent: false,
    };

    if (loginInfo?.user?.role === "admin") {
      roles.admin = true;
    } else if (loginInfo?.user?.role === "lecturer") {
      roles.userLecturer = true;
    } else if (loginInfo?.user?.role === "student") {
      roles.userStudent = true;
    }

    setAdmin(roles.admin);
    setUserLecturer(roles.userLecturer);
    setUserStudent(roles.userStudent);
  }, [loginInfo]);

  const addScheduleHandler = () => {
    if (window.scrollY > 766 && addSchedule) {
      window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    } else {
      if (window.innerWidth <= 1024 || showMobileFilters) {
        setShowMobileFilters(false);
      }
      setAddSchedule((prevState) => (prevState = !prevState));
      window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    }
  };

  const newOccurenceHandler = () => {
    setNewOccurenceAdded((prevState) => (prevState = !prevState));
  };

  const closeAdditionModalHandler = () => {
    setAddSchedule(false);
  };
  const showUserRollesHandler = () => {
    setShowUsersModal((prevState) => (prevState = !prevState));
  };
  const emptyFiltersHandler = () => {
    setFilteredData(data);
    setDropdownSelection(undefined);
    setScheduleRequestParams({
      startDate: new Date().toISOString(),
      endDate: ""
    })
    setNewOccurenceAdded(prevState => prevState = !prevState);
  };

  const userRole = admin
    ? "HALDUR"
    : userLecturer
    ? "ÕPPEJÕUD"
    : userStudent
    ? "ÕPILANE"
    : "";

  const mobileMenuHandler = () => {
    setOpenModalAnimation((prevState) => (prevState = !prevState));
    setHiddeMobileFilters((prevState) => (prevState = !prevState));
    setShowMobileMenu(true);
  };

  const mobileFiltersHandler = () => {
    if (window.scrollY > 766 && showMobileFilters) {
      window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    } else {
      setShowMobileFilters((prevState) => (prevState = !prevState));
      window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    }
    setAddSchedule(false);
  };

  const scheduleReloadHandler = () => {
    setScheduleLoading(true);
    setHasServerError("");
    setNewOccurenceAdded((prevState) => (prevState = !prevState));
  };

  // --- Google login ---

  const [googleAccessToken, setGoogleAcessToken] = useState([]);
  // const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
  let [googleProfile, setGoogleProfile] = useState(() => {
    let localData = localStorage.getItem("localGoogleProfile");
    return localData ? JSON.parse(localData) : {};
  });
  const [userPicture, setUserPicture] = useState([]);

  const login = useGoogleLogin({
    onSuccess: (googleResponse) => {
      setGoogleAcessToken(googleResponse.access_token); // selleks et seda saata backi autentimiseks

      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleResponse.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${googleResponse.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((result) => {
          setGoogleProfile(result.data);
          if (result.data) {
            localStorage.setItem(
              "localGoogleProfile",
              JSON.stringify(result.data)
            );
          }
        })
        .catch((err) => console.log(err)); // kui google acess tokeniga ligipääs ebaõnnestus
    },
    onError: (error) => console.log("Login Failed:", error), // kui google esmasel pöördumisel juba tekkis viga
  });

  useEffect(() => {
    setUserPicture(
      googleProfile?.picture ?? require("../assets/icons/user.png")
    );
  }, [googleProfile]);

  // log out function to log the user out of google and set the profile array to null
  const logOut = () => {
    localStorage.clear();
    googleLogout();
    setProfile(null);
    setGoogleProfile(null);
    setLoginInfo(null);
    setShowUsersModal(false);
    setAdmin(false);
    setUserLecturer(false);
    setUserStudent(false);
    setShowUsersList(false);
  };
  // --- Google login end ---

  // --- Schedule back login ---

  useEffect(() => {
    if(googleAccessToken?.length === 0) {
      return;
    }

    async function fetchProfile() {
      try {
        const response = await axios.post(
          `googleauth`,
          null, // edastate tühja päringu keha
          {
            headers: {
              Authorization: `Bearer ${googleAccessToken}`,
              Accept: "application/json",
            },
          }
        );
        setLoginInfo(response.data);
        if (response.data) {
          localStorage.setItem("token", JSON.stringify(response.data));
        }
        setShowUsersModal(false);
        console.log("Roll: ", response.data.user.role);
      } catch (error) {
        console.log(error);
      }
    }

    if (googleAccessToken) {
      fetchProfile();
    }
  }, [googleAccessToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotScheduled("Loenguid ei leitud!");
    }, 1000);
    return () => clearTimeout(timer);
  }, [filteredData]);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!openModalAnimation) {
      const timer = setTimeout(() => {
        setShowMobileMenu(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [openModalAnimation]);

  const usersListHandler = () => {
    setShowUsersList((prevState) => (prevState = !prevState));
    setShowUsersModal(false);
  };

  return (
    <div className="relative container mx-auto flex max-w-6xl flex-col font-sans text-center">
      <div className="mx-auto w-full">
        <div className="lg:fixed lg:w-[73rem] -ml-2 lg:h-28 bg-white z-10">
          <Header
            profile={profile}
            onClick={showUserRollesHandler}
            loginInfo={loginInfo}
            userPicture={userPicture}
            showUsersModal={showUsersModal}
            login={login}
            logOut={logOut}
            userAdminHandler={userAdminHandler}
            userRoll={userRole}
            admin={admin}
            isTabletOrMobile={isTabletOrMobile}
            addScheduleHandler={addScheduleHandler}
            scrollY={scrollY}
            mobileFiltersHandler={mobileFiltersHandler}
            mobileMenuHandler={mobileMenuHandler}
            showSchedule={addSchedule}
            showMobileFilters={showMobileFilters}
            hiddeMobileIcon={hiddeMobileFilters}
            userRollHandler={userRollHandler}
            onUsersManagement={usersListHandler}
            showMockLogin={userStudent || userLecturer || admin}
            usersListOpen={showUsersList}
            filtersNotification={dropdownsSelection?.length}
            showMobilePicture={userStudent || userLecturer || admin}
            openModalAnimation={openModalAnimation}
          />
        </div>

        {showMobileMenu && isTabletOrMobile && (
          <MobileMenu
            onClose={mobileMenuHandler}
            userInfo={userPicture}
            loginInfo={loginInfo}
            userRollHandler={userRollHandler}
            userAdminHandler={userAdminHandler}
            userRoll={userRole}
            login={login}
            logOut={logOut}
            showMobileMenu={openModalAnimation}
            onUsersManagement={usersListHandler}
            usersListOpen={showUsersList}
            showMockLogin={userStudent || userLecturer || admin}
            admin={admin}
          />
        )}
        {showUsersList && (
          <div>
            <UsersList onClose={usersListHandler} />
          </div>
        )}
        {!showUsersList && (
          <div className="flex flex-col lg:flex-row lg:justify-between mt-20 lg:mt-32 lgm:px-1 bg-white w-full">
            <div
              ref={filtersRef}
              className="flex-1 w-full px-2 lg:fixed top-20 bg-white lg:w-60 pt-2 lg:pt-3 lg:px-0 lg:pr-2 overflow-y-scroll lg:top-32 lg:bottom-0 no-scrollbar"
            >
              {admin && !isTabletOrMobile && (
                <AddScheduleButton
                  addScheduleHandler={addScheduleHandler}
                  addSchedule={addSchedule}
                />
              )}
              <div
                className={`filters ${
                  !showMobileFilters
                    ? !isTabletOrMobile
                      ? "w-full"
                      : "hidden"
                    : "w-full"
                } -mt-3 lg:mt-0 bg-white lg:relative mb-1 lg:mb-0`}
              >
                <ScheduleFilters
                  onEmptyFilters={emptyFiltersHandler}
                  onPassingFilters={dataFilterHandler}
                />
              </div>
            </div>

            <div className={`w-full px-2 lg:px-0 lg:pl-64`}>
              {scheduleLoading && <Spinner containerStyle="py-8" />}
              {hasServerError && (
                <RequestError requestHandler={scheduleReloadHandler} />
              )}
              {admin && addSchedule && (
                <ScheduleAddition
                  scheduled={data}
                  onNewOccurence={newOccurenceHandler}
                  onClose={closeAdditionModalHandler}
                  isTabletOrMobile={isTabletOrMobile}
                />
              )}
              {[
                ...new Set(
                  filteredData.map((e) => e.startTime.substring(0, 10))
                ),
              ].map((e, i, s) => {
                let noSchoolWork =
                  dateService.formatMilliseconds(s[i + 1]) -
                    dateService.formatMilliseconds(e) >
                  86400000;
                let startDate;
                let endDate;
                if (noSchoolWork) {
                  startDate = dateService.formatDayLongMonth(
                    addDays(new Date(e), 1)
                  );
                  endDate = dateService.formatDayLongMonth(
                    subDays(new Date(s[i + 1]), 1)
                  );
                }

                return (
                  <div
                    key={i}
                    className={`${i + 1 === s.length ? "mb-8" : ""}`}
                  >
                    <div
                      className={`flex items-center justify-between bg-collegeGreen w-full px-3 h-12 ${
                        i === 0 ? "mt-1 lg:mt-3" : "mt-9"
                      } text-base md:text-lg`}
                    >
                      <div className="flex">
                        <div className="font-bold pr-2 capitalize -ml-1 md:ml-0">
                          {dateService.formatWeekday(e)}
                        </div>
                        <div>{dateService.formatDayLongMonth(e)}</div>
                      </div>
                      <div>{dateService.formatYear(e)}</div>
                    </div>
                    <Table
                      userLecturer={userLecturer}
                      admin={admin}
                      isLoggedIn={admin || userLecturer || userStudent}
                      day={e}
                      filteredData={filteredData}
                      rawData={data}
                      onUpdate={newOccurenceHandler}
                      isTabletOrMobile={isTabletOrMobile}
                    />
                    {noSchoolWork && (
                      <p className="my-8">{`Perioodil ${startDate} - ${endDate} õppetööd ei toimu!`}</p>
                    )}
                  </div>
                );
              })}
              {(scheduleLoading ||
                response?.schedule.length === 0 ||
                filteredData.length === 0) && (
                <p className="mt-8">
                  {scheduleLoading
                    ? "Laeb"
                    : !hasServerError
                    ? notScheduled
                    : ""}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {!isTabletOrMobile && <GoTopButton />}
    </div>
  );
};

export default Home;
