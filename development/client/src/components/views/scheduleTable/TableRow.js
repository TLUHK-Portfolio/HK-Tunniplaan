import { Fragment, useState } from "react";
import TableSubjectInfo from "./TableSubjectInfo";
import { formatHoursMinutes } from "../../../utils/Format/Date";
import ScheduleAddition from "../ScheduleAddition";
import { ReactComponent as CameraIcon } from "../../../assets/icons/camera.svg";
import { ReactComponent as InfoIcon } from "../../../assets/icons/info.svg";
import { useEffect } from "react";

const TableBody = (props) => {
  const subjectCode =
    props.item.subject.subjectCode.length > 4
      ? props.item.subject.subjectCode
      : "HHHHH";
  const [showInfo, setShowInfo] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { isTabletOrMobile, admin } = props;

  useEffect(() => {
    if(!admin) {
      setShowEditModal(false);
    }
  })

  const extraInfoHandler = () => {
    setShowInfo((prevState) => (prevState = !prevState));
  };
  const joinLecturers = (item) => {
    if (item.lecturers)
      return item.lecturers
        .map((e) => `${e.firstName} ${e.lastName}`)
        .join(" ");
    return "";
  };

  const joinRooms = (item) => {
    if (item.rooms) return item.rooms.map((e) => e.room).join(" ");
    return "";
  };

  const mouseEnterHandler = () => {
    setShowEdit(true);
  };
  const mouseLeaveHandler = () => {
    setShowEdit(false);
  };

  const lectureEditHandler = () => {
    setShowEditModal(true);
  };

  const closeEditModalHandler = () => {
    setShowEditModal(false);
  };

  return (
    <Fragment>
      <tr
        className="text-xs xs2:text-sm md:text-base h-12 border border-borderGray divide-x divide-borderGray"
        key={props.id}
        onMouseEnter={mouseEnterHandler}
        onMouseLeave={mouseLeaveHandler}
      >
        <td className="p-0 sm:p-1 w-[5.5rem] md:w-28">
          {formatHoursMinutes(props.item.startTime) +
            "-" +
            formatHoursMinutes(props.item.endTime)}
        </td>

        <td
          onClick={extraInfoHandler}
          className="text-left xsmm:w-32 sm:w-60 xl:w-80 p-1 md:p-2 lg:hover:font-semibold duration-200"
        >
          <div className="flex flex-col text-left  md:flex-row md:justify-between">
            <div className="">
              {props.item.subject.subject} <br />
              <i>{props.item.comment}</i>
            </div>
            <div className="flex justify-center ">
            {(props.item.comment || props.item?.homeworks) &&
              props.isLoggedIn && <InfoIcon className="w-5 h-auto py-1" />}
            </div>
          </div>
        </td>

        <td className="p-1  md:p-2 xsmm:w-32 sm:w-60 xl:w-80 text-left">
          {joinLecturers(props.item)}
        </td>
        
        <td className="p-1 md:p-2 w-fit md:w-48">
          <div className="flex flex-col justify-between items-center lg:flex-row">
            {joinRooms(props.item)}
            <div
              className={`flex items-center w-full ${
                !showEdit && props.admin && !props.item.distanceLink
                  ? "justify-center"
                  : "pl-2 space-x-2 justify-between"
              } xsmm:justify-center  xs:space-x-8 lg:justify-end lg:space-x-4 lg:w-14${
                props.item.rooms ? "" : "md:w-full"
              } pt-1 pr-1 md:pr-0 md:pt-0`}
            >
              {props.item.distanceLink && props.isLoggedIn && (
                <div>
                  <a
                    rel="noreferrer"
                    target="_blank"
                    href={props.item.distanceLink}
                  >
                    <CameraIcon className="w-5 h-auto" />
                  </a>
                </div>
              )}
              {(showEdit || isTabletOrMobile) && props.admin && (
                <div
                  className={`${
                    showEdit && props.item.distanceLink ? "ml-5" : ""
                  }`}
                >
                  <i
                    onClick={lectureEditHandler}
                    className="bi bi-pencil-fill cursor-pointer pr-1"
                  ></i>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
      {showEditModal && props.admin && (
        <tr className="">
          <td colSpan={4} className="border-x border-borderGray">
            <ScheduleAddition
              onClose={closeEditModalHandler}
              editMode="editMode"
              editData={props.item}
              onUpdate={props.onUpdate}
              scheduled={props.rawData}
              isTabletOrMobile={props.isTabletOrMobile}
            />
          </td>
        </tr>
      )}
      {showInfo && (
        <TableSubjectInfo
          admin={props.admin}
          userLecturer={props.userLecturer}
          onClick={extraInfoHandler}
          item={props.item}
          data={props.data}
          rawData={props.rawData}
          onUpdate={props.onUpdate}
          isLoggedIn={props.isLoggedIn}
        />
      )}
    </Fragment>
  );
};

export default TableBody;
