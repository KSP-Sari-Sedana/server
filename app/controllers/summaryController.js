import summaryRepository from "../repositories/summaryRepository.js";
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

export default { getSummary };
