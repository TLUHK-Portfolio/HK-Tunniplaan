// Scheduled interfaces

import { RowDataPacket } from "mysql2";

interface ISchedule extends RowDataPacket {
  id: number;
  startTime: Date;
  endTime: Date;
  room: string;
  comment: string;
  course: string;
  subject: string;
  subjectCode: string;
  lecturer: string;
}

export { ISchedule };
