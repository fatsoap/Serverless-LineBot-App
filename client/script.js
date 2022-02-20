window.onload = async function () {
  let h3 = document.getElementById('profile');
  if (!(await liff.isInClient())) {
    return notInLiff();
  }
  try {
    await liff.init({ liffId: '1656848315-R6LQQLwG' });
    await initApp();
  } catch (err) {
    liff.closeWindow();
  }
};

async function initApp() {
  if (!(await liff.isLoggedIn())) {
    return notLoggedIn();
  }
  try {
    let profile = await liff.getProfile();
    /** get Today's Products */
  } catch (err) {}
}

async function notInLiff() {
  console.log('Not in LIFF');
  liff.closeWindow();
}

async function notLoggedIn() {
  console.log('Not Logged In');
  liff.closeWindow();
}
