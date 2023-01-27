function accNumber(accNumber) {
  let formatedAccNumber = "";
  for (let i = 0; i < accNumber?.toString().length; i++) {
    if (i > 0 && (i + 1) % 3 === 0) {
      formatedAccNumber += " ";
    }
    formatedAccNumber += accNumber?.toString()[i];
  }
  return formatedAccNumber;
}

export default { accNumber };
