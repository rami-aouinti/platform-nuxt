type SweetAlertResult = { isConfirmed?: boolean; value?: any }

type SweetAlertFn = ((..._args: any[]) => Promise<SweetAlertResult>) & {
  fire: (..._args: any[]) => Promise<SweetAlertResult>
  showValidationMessage: (..._args: any[]) => void
  isLoading: () => boolean
  showLoading: () => void
  getHtmlContainer: () => HTMLElement | null
  getTimerLeft: () => number
}

const swal = (async () => ({})) as SweetAlertFn
swal.fire = async () => ({})
swal.showValidationMessage = () => {}
swal.isLoading = () => false
swal.showLoading = () => {}
swal.getHtmlContainer = () => null
swal.getTimerLeft = () => 0

export default swal
