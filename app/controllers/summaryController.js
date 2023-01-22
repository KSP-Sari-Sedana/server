import summaryRepository from "../repositories/summaryRepository.js";
import { APIError } from "../helpers/appError.js";
import errorCode from "../constants/errorCode.js";
import { APISuccess } from "../helpers/response.js";

async function getSummary(req, res) {
  const { id } = req.user;

  let saving = await summaryRepository.findSavingBalance(id);
  const { loanTotal } = await summaryRepository.findLoanTotal(id);
  const { totalLoanPayment } = await summaryRepository.findTotalLoanPayment(id);

  saving = {
    balance: saving.balance || 0,
  };

  const loan = {
    loanTotal: loanTotal || 0,
    totalLoanPayment: totalLoanPayment || 0,
    loanBalance: loanTotal - totalLoanPayment,
  };

  res.status(200).json(APISuccess("Summary berhasil didapatkan", { saving, loan }));
}

async function getSummaryByAdmin(req, res) {
  if (req.user.role !== "Admin") throw new APIError(errorCode.RESOURCE_FORBIDDEN, "Anda tidak memiliki akses", 403);
  const totalUser = await summaryRepository.findTotalUser();
  const totalAdmin = await summaryRepository.findByUserRole("Admin");
  const totalTeller = await summaryRepository.findByUserRole("Teller");
  const totalAnggota = await summaryRepository.findByUserRole("Anggota");
  const totalMember = await summaryRepository.findByUserRole("Member");
  const totalActive = await summaryRepository.findByUserStatus("Aktif");
  const totalReviewed = await summaryRepository.findByUserStatus("Ditinjau");
  const totalNonActive = await summaryRepository.findByUserStatus("Nonaktif");
  res.status(200).json(
    APISuccess("Summary berhasil didapatkan", {
      user: totalUser,
      role: { ...totalAdmin, ...totalTeller, ...totalAnggota, ...totalMember },
      status: { ...totalActive, ...totalReviewed, ...totalNonActive },
    })
  );
}

export default { getSummary, getSummaryByAdmin };
