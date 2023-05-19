import { useCallback, useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import SearchDropdown from "../UI/Dropdown/SearchDropdown";
import CalendarInput from "../UI/Calendar/CalendarInput";

const ScheduleFilters = (props) => {
  const [courseData, setCourseData] = useState([]);
  const [lecturerData, setLecturerData] = useState([]);
  const [roomsData, setRoomsData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [isReset, setIsReset] = useState(false);
  
  const [courseFilterDefValue, setCourseFilterDefValue] = useState(() => {
    let tmp = localStorage.getItem('courseCode');
    if (tmp === {}) { return null;} 
    return tmp ? JSON.parse(tmp) : undefined;    
  });
  
  const [lecturerFilterDefValue, setLecturerFilterDefValue] = useState();
  const [roomFilterDefValue, setRoomFilterDefValue] = useState();
  const [subjectFilterDefValue, setSubjectFilterDefValue] = useState();

  const {
    response: courseResponse,
    isLoading: courseLoading,
    error: courseError,
  } = useAxios({ method: "get", url: "/courses" });
  const {
    response: lecturerResponse,
    isLoading: lecturerLoading,
    error: lecturerError,
  } = useAxios({ method: "get", url: "/lecturers" });
  const {
    response: roomResponse,
    isLoading: roomLoading,
    error: roomError,
  } = useAxios({ method: "get", url: "/rooms" });
  const {
    response: subjectsResponse,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useAxios({ method: "get", url: "/subjects" });

  const workCourseData = useCallback(() => {
    if (!courseLoading && courseResponse !== undefined) {
      const courses = [];

      for (const key in courseResponse.courses) {
        courses.push({
          label: courseResponse.courses[key].courseCode,
          value: courseResponse.courses[key].courseCode,
        });
      }
      setCourseData(courses);
    }
  }, [courseLoading, courseResponse]);

  const workLecturerData = useCallback(() => {
    if (!lecturerLoading && lecturerResponse !== undefined) {
      const lecturers = [];

      for (const key in lecturerResponse.lecturers) {
        lecturers.push({
          label:
            lecturerResponse.lecturers[key].firstName +
            " " +
            lecturerResponse.lecturers[key].lastName,
          value:
            lecturerResponse.lecturers[key].firstName +
            " " +
            lecturerResponse.lecturers[key].lastName,
        });
      }
      setLecturerData(lecturers);
    }
  }, [lecturerLoading, lecturerResponse]);

  const workRoomsData = useCallback(() => {
    if (!roomLoading && roomResponse !== undefined) {
      const rooms = [];

      for (const key in roomResponse.rooms) {
        rooms.push({
          label: roomResponse.rooms[key].room,
          value: roomResponse.rooms[key].room,
        });
      }
      setRoomsData(rooms);
    }
  }, [roomLoading, roomResponse]);

  const workSubjectsData = useCallback(() => {
    if (!subjectsLoading && subjectsResponse !== undefined) {
      const subjects = [];

      for (const key in subjectsResponse.subjects) {
        subjects.push({
          label: subjectsResponse.subjects[key].subject,
          value: subjectsResponse.subjects[key].subject,
        });
      }
      setSubjectsData(subjects);
    }
  }, [subjectsLoading, subjectsResponse]);

  useEffect(() => {
    workCourseData();
  }, [workCourseData, courseResponse]);
  useEffect(() => {
    workLecturerData();
  }, [workLecturerData, lecturerResponse]);
  useEffect(() => {
    workRoomsData();
  }, [workRoomsData, roomResponse]);
  useEffect(() => {
    workSubjectsData();
  }, [workSubjectsData, subjectsResponse]);

  const filtersHandler = (filterObj) => {
    console.log("filterObj: ", filterObj);
    if (isReset) setIsReset((prevState) => (prevState = !prevState));
    props.onPassingFilters(filterObj);
  };

  // const filtersHandler = useCallback((filterObj) => {
  //   if (isReset) setIsReset((prevState) => (prevState = !prevState));
  //   props.onPassingFilters(filterObj);
  // }, [isReset, props]); 


  const emptyFiltersHandler = () => {
    setIsReset((prevState) => (prevState = !prevState));
    props.onEmptyFilters();
  };
  // const emptyFiltersHandler = useCallback(() => {
  //   setIsReset(prevState => !prevState);
  //   props.onEmptyFilters();
  // }, [props]);


  return (
    <div className="flex flex-col space-y-2 -mt-1 lg:mt-0">
      <div className="pt-2 lg:pt-0">
        <SearchDropdown
          reset={isReset}
          onChange={filtersHandler}
          defValue={courseFilterDefValue}
          options={courseData}
          label="Kursus"
          name="courseCode"
          isMulti={true}
          isRemembered={true}
          className="order-2"
        />
      </div>

      <div>
        <CalendarInput reset={isReset} onChange={filtersHandler} />
      </div>

      <div>
        <SearchDropdown
          reset={isReset}
          onChange={filtersHandler}
          defValue={subjectFilterDefValue}
          options={subjectsData}
          label="Õppeaine"
          name="subject"
          isMulti={true}
          isRemembered={true}
        />
      </div>
      <div>
        <SearchDropdown
          reset={isReset}
          onChange={filtersHandler}
          defValue={lecturerFilterDefValue}
          options={lecturerData}
          label="Õppejõud"
          name="lecturer"
          isMulti={true}
          isRemembered={true}
        />
      </div>
      <div>
        <SearchDropdown
          reset={isReset}
          onChange={filtersHandler}
          defValue={roomFilterDefValue}
          options={roomsData}
          label="Ruum"
          name="room"
          isMulti={true}
          isRemembered={true}
        />
      </div>
      <button
        onClick={emptyFiltersHandler}
        type="button"
        name="admin"
        className="mx-auto px-2 w-1/3 h-8 border border-borderGray shadow text-sm font-bold text-neutral-700 lg:w-1/2 lg:hover:bg-borderGray lg:hover:shadow-lg duration-200"
      >
        Tühjenda
      </button>
    </div>
  );
};

export default ScheduleFilters;
