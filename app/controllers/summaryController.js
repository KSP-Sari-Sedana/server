import summaryRepository from "../repositories/summaryRepository.js";
import { APIError, ReqError } from "../helpers/appError.js";
import { APISuccess } from "../helpers/response.js";
import errorCode from "../constants/errorCode.js";

async function getSummary(req, res) {
  const { id } = req.user;

  const saving = await summaryRepository.findSavingBalance(id);
  if (!saving) throw new ReqError(errorCode.RESOURCE_NOT_FOUND, "Summary tidak ditemukan", 404);

  const { loanTotal } = await summaryRepository.findLoanTotal(id);
  if (!loanTotal) throw new ReqError(errorCode.RESOURCE_NOT_FOUND, "Summary tidak ditemukan", 404);

  const { totalLoanPayment } = await summaryRepository.findTotalLoanPayment(id);
  if (!totalLoanPayment) throw new ReqError(errorCode.RESOURCE_NOT_FOUND, "Summary tidak ditemukan", 404);

  const loan = {
    loanTotal,
    totalLoanPayment,
    loanBalance: loanTotal - totalLoanPayment,
  };

  res.status(200).json(APISuccess("Summary berhasil ditemukan", { saving, loan }));
}

export default { getSummary };
