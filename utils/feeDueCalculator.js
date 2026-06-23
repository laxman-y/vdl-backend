function getBaseDate(student) {
  let baseDate = null;

  if (student.disableLogs && student.disableLogs.length > 0) {
    const lastLog =
      student.disableLogs[student.disableLogs.length - 1];

    if (lastLog.enabledDate) {
      baseDate = lastLog.enabledDate;
    }
  }

  return baseDate || student.admissionDate;
}

function getBaseDay(student) {
  const baseDate = getBaseDate(student);

  if (!baseDate) return null;

  const d = new Date(baseDate);

  return d.getDate();
}

function getBaseMonthKey(student) {
  const baseDate = getBaseDate(student);

  if (!baseDate) return null;

  const d = new Date(baseDate);

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getLastPaidMonthKey(student) {
  if (!student.fees) return null;

  const paidFees = student.fees
    .filter((f) => f.status === "paid" && f.month)
    .sort((a, b) => new Date(b.month) - new Date(a.month));

  return paidFees.length ? paidFees[0].month : null;
}

function getNextMonthKey(monthKey) {
  if (!monthKey) return null;

  const [y, m] = monthKey.split("-").map(Number);

  const d = new Date(y, m, 1);

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
}

function calculateFeeStatus(student) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (student.status === "disabled") {
    return {
      allowed: false,
      reason: "Student disabled"
    };
  }

  const baseDay = getBaseDay(student);

  const lastPaidMonth =
    getLastPaidMonthKey(student);

  const baseMonth =
    getBaseMonthKey(student);

  let dueMonth = null;

  if (lastPaidMonth && baseMonth) {
    const lastPaidDate =
      new Date(lastPaidMonth + "-01");

    const baseDate =
      new Date(baseMonth + "-01");

    const latest =
      lastPaidDate > baseDate
        ? lastPaidDate
        : baseDate;

    const next = new Date(
      latest.getFullYear(),
      latest.getMonth() + 1,
      1
    );

    dueMonth = `${next.getFullYear()}-${String(
      next.getMonth() + 1
    ).padStart(2, "0")}`;
  } else if (lastPaidMonth) {
    dueMonth = getNextMonthKey(lastPaidMonth);
  } else if (baseMonth) {
    dueMonth = baseMonth;
  }

  let dueDate = null;

  if (baseDay && dueMonth) {
    const [y, m] =
      dueMonth.split("-").map(Number);

    dueDate = new Date(
      y,
      m - 1,
      baseDay
    );

    dueDate.setHours(0, 0, 0, 0);

    // 15-day grace period
    const graceDate = new Date(dueDate);

    graceDate.setDate(
      graceDate.getDate() + 15
    );

    if (today >= graceDate) {
      return {
        allowed: false,
        reason: "Fee overdue",
        dueDate
      };
    }
  }

  return {
    allowed: true,
    dueDate
  };
}

module.exports = calculateFeeStatus;
