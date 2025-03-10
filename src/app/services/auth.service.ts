import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl: string = environment.apiUrl;
  baseUrl: string = `${this.apiUrl}/user`;
  walletBaseUrl: string = `${this.apiUrl}/wallet`;
  partyBaseUrl: string = `${this.apiUrl}/party`;
  eliteOrderBaseUrl: string = `${this.apiUrl}/elite-order`;
  couponBaseUrl: string = `${this.apiUrl}/coupon`;
  chatUrl: string = `${this.apiUrl}/chat`;
  adminUrl: string = `${this.apiUrl}/admin`;
  minBalanceForMatch: number = 12;

  getHttpHeaders(): HttpHeaders {
    const sessionToken = this.getTokenFromSession();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': sessionToken,
    })
  }

  constructor(private http: HttpClient) { }

  /*********************************** START LOGIN ***********************************/
  sendOtp(data: any) {
    return this.http.post<any>(`${this.baseUrl}/login`, data);
  }

  verifyOtp(data: any) {
    return this.http.post<any>(`${this.baseUrl}/validate`, data);
  }

  resendOtp(data: any) {
    return this.http.post<any>(`${this.baseUrl}/resend`, data);
  }

  getDiscordLoginUrl() {
    return `${this.baseUrl}/discord`;
  }

  getGoogleLoginUrl() {
    return `${this.baseUrl}/google`;
  }

  getSocialLoginToken(email: string) {
    return this.http.post<any>(`${this.baseUrl}/social-token`, { email: email });
  }

  logoutUser() {
    return this.http.post<any>(`${this.baseUrl}/logout`, {}, { headers: this.getHttpHeaders() });
  }
  /*********************************** END LOGIN ***********************************/

  /*********************************** START 1 TO 1 ***********************************/
  fetchProUsers(filterData: string[] = []) {
    return this.http.get<any>(`${this.baseUrl}?platform=${filterData.join(',')}`, { headers: this.getHttpHeaders() });
  }

  sendRequestForMatch(proUserId: string | undefined) {
    return this.http.post<any>(`${this.baseUrl}/match`, { proUserId: proUserId }, { headers: this.getHttpHeaders() });
  }

  pendingMyOrders() {
    return this.http.get<any>(`${this.baseUrl}/orders/pending`, { headers: this.getHttpHeaders() });
  }

  inProgressMyOrders() {
    return this.http.get<any>(`${this.baseUrl}/orders/inprogress`, { headers: this.getHttpHeaders() });
  }

  cancelMatchRequest(proUserId: string | undefined) {
    return this.http.post<any>(`${this.baseUrl}/match/action/cancel`, { userId: proUserId }, { headers: this.getHttpHeaders() });
  }

  startMatchTimer(clientUserId: string | undefined) {
    return this.http.post<any>(`${this.baseUrl}/match/action/start`, { userId: clientUserId }, { headers: this.getHttpHeaders() });
  }

  completedMyOrders() {
    return this.http.get<any>(`${this.baseUrl}/orders/completed`, { headers: this.getHttpHeaders() });
  }

  acceptMatchRequest(clientUserId: string) {
    return this.http.post<any>(`${this.baseUrl}/match/action`, { userId: clientUserId, action: 'approve' }, { headers: this.getHttpHeaders() });
  }

  rejectMatchRequest(clientUserId: string | undefined) {
    return this.http.post<any>(`${this.baseUrl}/match/action`, { userId: clientUserId, action: 'reject' }, { headers: this.getHttpHeaders() });
  }

  fetchOrderDetails(orderId: string) {
    return this.http.get<any>(`${this.baseUrl}/orders/details/${orderId}`, { headers: this.getHttpHeaders() });
  }

  stopTimer(matchId: string, timeLogged: number) {
    return this.http.post<any>(`${this.baseUrl}/match/stop`, { matchId: matchId, timeLogged: timeLogged }, { headers: this.getHttpHeaders() });
  }

  saveReview(dataToUpdate: any) {
    return this.http.post<any>(`${this.baseUrl}/match/review`, dataToUpdate, { headers: this.getHttpHeaders() });
  }
  /*********************************** END 1 TO 1 ***********************************/


  /*********************************** START OTHERS ***********************************/
  getMyWallet() {
    return this.http.get<any>(`${this.walletBaseUrl}`, { headers: this.getHttpHeaders() });
  }

  updateUserProfile(data: any) {
    return this.http.patch(`${this.baseUrl}/update`, data, { headers: this.getHttpHeaders() });
  }

  getSelfProfile() {
    return this.http.get(`${this.baseUrl}/profile`, { headers: this.getHttpHeaders() });
  }

  proUserRequest(data: any) {
    return this.http.post<any>(`${this.baseUrl}/request`, data, { headers: this.getHttpHeaders() });
  }

  updateUserStatus(data: any) {
    return this.http.post<any>(`${this.baseUrl}/changeStatus`, data, { headers: this.getHttpHeaders() });
  }

  createStripeSession(amount: string) {
    return this.http.post<any>(`${this.walletBaseUrl}/session`, { amount: amount }, { headers: this.getHttpHeaders() });
  }

  getMyTransactions() {
    return this.http.get<any>(`${this.walletBaseUrl}/transactions`, { headers: this.getHttpHeaders() });
  }

  getBankDetails(email?: string) {
    let urlToLoad = `${this.baseUrl}/profile/bank`;
    if (email) {
      urlToLoad = `${this.baseUrl}/profile/bank?otherUserEmail=${email}`;
    }
    return this.http.get<any>(urlToLoad, { headers: this.getHttpHeaders() });
  }

  updateBankDetails(data: any) {
    return this.http.patch<any>(`${this.baseUrl}/profile/bank`, data, { headers: this.getHttpHeaders() });
  }

  getImageUploadUrl(contentType: string) {
    return this.http.get<any>(`${this.baseUrl}/image/upload?fileContentType=${contentType}`, { headers: this.getHttpHeaders() });
  }

  requestForWithdraw(data: any) {
    return this.http.post<any>(`${this.walletBaseUrl}/withdraw`, data, { headers: this.getHttpHeaders() });
  }

  uploadImage(url: string, data: any) {
    return this.http.put<any>(url, data);
  }

  getMyNotifications() {
    return this.http.get<any>(`${this.apiUrl}/notification`, { headers: this.getHttpHeaders() });
  }

  markSingleNotificationAsRead(notificationId: string) {
    return this.http.post<any>(`${this.apiUrl}/notification/read/${notificationId}`, {}, { headers: this.getHttpHeaders() });
  }

  markAllNotificationsAsRead() {
    return this.http.post<any>(`${this.apiUrl}/notification/read`, {}, { headers: this.getHttpHeaders() });
  }

  getAvailableGames() {
    return this.http.get<any>(`${this.apiUrl}/game`, { headers: this.getHttpHeaders() });
  }
  /*********************************** END OTHERS ***********************************/


  /*********************************** START PREMADE PARTY ***********************************/
  addNewParty(partyData: any) {
    return this.http.post<any>(`${this.partyBaseUrl}`, partyData, { headers: this.getHttpHeaders() });
  }

  updateParty(dataToUpdate: any, partyId: string) {
    return this.http.patch<any>(`${this.partyBaseUrl}/${partyId}`, dataToUpdate, { headers: this.getHttpHeaders() });
  }

  getAvailablePremadeParties() {
    return this.http.get<any>(`${this.partyBaseUrl}`, { headers: this.getHttpHeaders() });
  }

  inProgressPartiesList() {
    return this.http.get<any>(`${this.partyBaseUrl}/inprogress`, { headers: this.getHttpHeaders() });
  }

  completedPartiesList() {
    return this.http.get<any>(`${this.partyBaseUrl}/completed`, { headers: this.getHttpHeaders() });
  }

  fetchPartyDetails(partyId: string) {
    return this.http.get<any>(`${this.partyBaseUrl}/details/${partyId}`, { headers: this.getHttpHeaders() });
  }

  joinPremadeParty(partyId: string) {
    return this.http.post<any>(`${this.partyBaseUrl}/join`, { partyId: partyId }, { headers: this.getHttpHeaders() });
  }

  finishPremadeParty(partyId: string) {
    return this.http.post<any>(`${this.partyBaseUrl}/finish`, { id: partyId }, { headers: this.getHttpHeaders() });
  }

  unhidePremadeParty(partyId: string) {
    return this.http.post<any>(`${this.partyBaseUrl}/unhide`, { id: partyId }, { headers: this.getHttpHeaders() });
  }

  endPremadeParty(dataToPost: any) {
    return this.http.post<any>(`${this.partyBaseUrl}/end`, dataToPost, { headers: this.getHttpHeaders() });
  }

  savePartyReview(data: any) {
    return this.http.post<any>(`${this.partyBaseUrl}/review`, data, { headers: this.getHttpHeaders() });
  }

  showPartyReview(partyId: string) {
    return this.http.get<any>(`${this.partyBaseUrl}/review?partyId=${partyId}`, { headers: this.getHttpHeaders() });
  }

  stopPartyTimer(matchId: string | undefined) {
    return this.http.post<any>(`${this.partyBaseUrl}/stop`, { matchId: matchId }, { headers: this.getHttpHeaders() });
  }

  stopPartyTimerPro(matchId: string, email: string, timeLogged: number) {
    return this.http.post<any>(`${this.partyBaseUrl}/stop`, { matchId: matchId, email: email, timeLogged: timeLogged }, { headers: this.getHttpHeaders() });
  }
  /*********************************** END PREMADE PARTY ***********************************/


  /*********************************** START ELITE ORDER ***********************************/
  startEliteOrder(proUserEmailList: string[]) {
    return this.http.post<any>(`${this.eliteOrderBaseUrl}`, { proUsernames: proUserEmailList }, { headers: this.getHttpHeaders() })
  }

  addProToEliteOrder(requestBody: any) {
    return this.http.post<any>(`${this.eliteOrderBaseUrl}/add-pro`, { ...requestBody }, { headers: this.getHttpHeaders() });
  }

  fetchPendingEliteOrders() {
    return this.http.get<any>(`${this.eliteOrderBaseUrl}/pending`, { headers: this.getHttpHeaders() });
  }

  fetchInProgressEliteOrders() {
    return this.http.get<any>(`${this.eliteOrderBaseUrl}/inprogress`, { headers: this.getHttpHeaders() });
  }

  stopEliteOrder(requestBody: any) {
    return this.http.post<any>(`${this.eliteOrderBaseUrl}/stop`, { ...requestBody }, { headers: this.getHttpHeaders() });
  }

  fetchCompletedEliteOrders() {
    return this.http.get<any>(`${this.eliteOrderBaseUrl}/completed`, { headers: this.getHttpHeaders() });
  }

  getEliteOrderDetails(orderId: string) {
    return this.http.get<any>(`${this.eliteOrderBaseUrl}/details/${orderId}`, { headers: this.getHttpHeaders() });
  }

  initiateEliteOrderRefund(refundAmount: string, orderId: string, proUserId: string) {
    return this.http.post<any>(`${this.eliteOrderBaseUrl}/refund`, { refundAmount: refundAmount, orderId: orderId, proUserId: proUserId }, { headers: this.getHttpHeaders() });
  }

  actionEliteOrder(actionType: string, requestBody: any) {
    return this.http.post<any>(`${this.eliteOrderBaseUrl}/action/${actionType}`, { ...requestBody }, { headers: this.getHttpHeaders() });
  }

  closeEliteOrder(orderId: string) {
    return this.http.post<any>(`${this.eliteOrderBaseUrl}/close`, { orderId: orderId }, { headers: this.getHttpHeaders() });
  }
  /*********************************** END ELITE ORDER ***********************************/


  /*********************************** START CHAT MESSAGE ***********************************/
  getChatList() {
    return this.http.get<any>(`${this.chatUrl}/list`, { headers: this.getHttpHeaders() });
  }

  getMessageList(conversationId: string | undefined) {
    return this.http.get<any>(`${this.chatUrl}/messages/list?conversation=${conversationId}`, { headers: this.getHttpHeaders() });
  }
  /*********************************** END CHAT MESSAGE ***********************************/

  /*********************************** START COUPONS ***********************************/
  getCouponList() {
    return this.http.get<any>(`${this.couponBaseUrl}`, { headers: this.getHttpHeaders() });
  }

  addNewCoupon(dataToUpdate: any) {
    return this.http.post<any>(`${this.couponBaseUrl}`, dataToUpdate, { headers: this.getHttpHeaders() });
  }

  updateCoupon(couponId: string, dataToUpdate: any) {
    return this.http.patch<any>(`${this.couponBaseUrl}/${couponId}`, dataToUpdate, { headers: this.getHttpHeaders() });
  }

  actionCoupon(couponId: string, action: string) {
    return this.http.post<any>(`${this.couponBaseUrl}/action/${action}`, { id: couponId }, { headers: this.getHttpHeaders() });
  }

  getSingleCoupon(couponId: string) {
    return this.http.get<any>(`${this.couponBaseUrl}/${couponId}`, { headers: this.getHttpHeaders() });
  }

  deleteCoupon(couponId: string) {
    return this.http.delete<any>(`${this.couponBaseUrl}/${couponId}`, { headers: this.getHttpHeaders() });
  }

  applyCoupon(couponCode: string) {
    return this.http.post<any>(`${this.couponBaseUrl}/apply`, { code: couponCode }, { headers: this.getHttpHeaders() });
  }

  getUsersByCoupon(couponId: string) {
    return this.http.get<any>(`${this.couponBaseUrl}/users/${couponId}`, { headers: this.getHttpHeaders() });
  }
  /*********************************** END COUPONS ************************************/

  /*********************************** START STORAGE FUNCTIONS ***********************************/
  setTokenToSession(token: string, email: string, username: string, userType: string, currentStatus: string = 'online') {
    sessionStorage.setItem('ggToken', JSON.stringify({ token: token, email: email, username: username, usertype: userType, currentStatus: currentStatus }));
  }

  setTempEmailToSession(email: string) {
    sessionStorage.setItem('ggTempEmail', email);
  }

  getChosenGameNameFromSession(): string {
    const valueFromSession = sessionStorage.getItem('ggChosenGame');
    if (!valueFromSession) {
      return '';
    }
    return JSON.parse(valueFromSession).title;
  }

  getTempEmailFromSession() {
    const valueFromSession = sessionStorage.getItem('ggTempEmail');
    if (!valueFromSession) {
      return '';
    }
    return valueFromSession;
  }

  clearTempEmail() {
    sessionStorage.removeItem('ggTempEmail');
  }

  getEmailFromSession(): string {
    const valueFromSession = sessionStorage.getItem('ggToken');
    if (!valueFromSession) {
      return '';
    } else {
      return JSON.parse(valueFromSession).email;
    }
  }

  getTokenFromSession(): string {
    const valueFromSession = sessionStorage.getItem('ggToken');
    if (!valueFromSession) {
      return '';
    } else {
      return JSON.parse(valueFromSession).token;
    }
  }

  getUsernameFromSession(): string {
    const valueFromSession = sessionStorage.getItem('ggToken');
    if (!valueFromSession) {
      return '';
    } else {
      return JSON.parse(valueFromSession).username;
    }
  }

  getUserTypeFromSession(): string {
    const valueFromSession = sessionStorage.getItem('ggToken');
    if (!valueFromSession) {
      return '';
    } else {
      return JSON.parse(valueFromSession).usertype;
    }
  }

  setUserImageInSession(value: string): void {
    sessionStorage.setItem('ggUserImage', value);
  }

  getUserImageFromSession(): string {
    const valueFromSession = sessionStorage.getItem('ggUserImage');
    if (!valueFromSession) {
      return '';
    }
    return valueFromSession;
  }

  clearSessionToken(): void {
    sessionStorage.removeItem('ggToken');
  }
  /*********************************** END STORAGE FUNCTIONS ***********************************/


  /* Admin functions below */
  getBlogsList() {
    return this.http.get<any>(`${this.adminUrl}/blog`, { headers: this.getHttpHeaders() });
  }

  addNewBlog(data: any) {
    return this.http.post<any>(`${this.adminUrl}/blog`, data, { headers: this.getHttpHeaders() });
  }

  viewBlog(blogId: string) {
    return this.http.get<any>(`${this.adminUrl}/blog/${blogId}`, { headers: this.getHttpHeaders() });
  }

  updateBlog(blogId: string, data: any) {
    return this.http.patch<any>(`${this.adminUrl}/blog/${blogId}`, data, { headers: this.getHttpHeaders() });
  }

  publishBlog(blogId: string) {
    return this.http.post<any>(`${this.adminUrl}/blog/${blogId}/action/publish`, {}, { headers: this.getHttpHeaders() });
  }

  archiveBlog(blogId: string) {
    return this.http.post<any>(`${this.adminUrl}/blog/${blogId}/action/archive`, {}, { headers: this.getHttpHeaders() });
  }

  getSessionsReport(filterType: string, filteredDate: string) {
    return this.http.get<any>(`${this.adminUrl}/reports/session?filterType=${filterType}&filteredDate=${filteredDate}`, { headers: this.getHttpHeaders() });
  }

  getHoursReport(proUsername: string, filterType: string | null) {
    return this.http.get<any>(`${this.adminUrl}/reports/hour?username=${proUsername}&filterType=${filterType}`, { headers: this.getHttpHeaders() });
  }

  getFinanceReport(proUsername: string, filterStartDate: string, filterEndDate: string) {
    return this.http.get<any>(`${this.adminUrl}/reports/finance?username=${proUsername}&filteredStartDate=${filterStartDate}&filteredEndDate=${filterEndDate}`, { headers: this.getHttpHeaders() });
  }

  getUserLogs(userEmail: String, days: number) {
    return this.http.get<any>(`${this.adminUrl}/logs?userEmail=${userEmail}&days=${days?.toString()}`, { headers: this.getHttpHeaders() });
  }

}
