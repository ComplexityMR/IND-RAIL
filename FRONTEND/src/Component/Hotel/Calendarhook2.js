import { useState } from "react";
import {
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  subDays
} from "date-fns";

export default function useDateRange() {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  const today = startOfDay(new Date());

  const onDateClick = (date) => {
    if (isBefore(date, today)) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }
    if (isAfter(date, checkIn)) {
      setCheckOut(date);
    } else {
      setCheckIn(date);
    }
  };
  const isStart = (date) =>
    checkIn && isSameDay(date, checkIn);

  const isEnd = (date) =>
    checkOut && isSameDay(date, checkOut);

  const isInRange = (date) =>
    checkIn &&
    checkOut &&
    isAfter(date, checkIn) &&
    isBefore(date, checkOut);

  const isDisabled = (date) => {
  return (isBefore(date, today));
};

  return {
    checkIn,
    checkOut,
    onDateClick,
    isStart,
    isEnd,
    isInRange,
    isDisabled
  };
}