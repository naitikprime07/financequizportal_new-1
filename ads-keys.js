
/* ===== TEST AD UNIT CODES (Replace with real GAM ad units before going live) ===== */
/*
 * GOOGLE TEST NETWORK: /6355414
 * These test units will serve sample/test ads from Google.
 * When ready for production, replace with your real GAM ad unit codes:
 *   display_001: "/23338698373/financequizhub_display_001"
 *   display_002: "/23338698373/financequizhub_display_002"
 *   display_003: "/23338698373/financequizhub_display_003"
 *   interstitial_001: "/23338698373/financequizhub_interstitial_001"
 *   anchor_001: "/23338698373/financequizhub_anchor_001"
 *   rewoarded_001: "/23338698373/financequizhub_rewarded_001"
 */
window.adsKeys = {
    display_001: "/21775744923/example/banner",
    display_002: "/6355419/Travel/Europe/France",
    display_003: "/6355419/Travel/Europe/France",
    interstitial_001: "/21775744923/example/interstitial",
    anchor_001: "/21775744923/example/adaptive-banner",
    rewoarded_001: "/6499/example/rewarded",

};

console.log("[ADKEYS] ads-keys.js LOADED. Ad units:", JSON.stringify(window.adsKeys));


let rewardedAd = null;
let isRewardReady = false;
let pendingUrl = null;
let showRewardedFn = null;


/*-------------- REWARDED SLOT (must be defined BEFORE enableServices) -------------------*/
/* ads-keys.js loads synchronously in <head>, so this queues the rewarded slot
   before any body inline banner script calls googletag.enableServices(). */

window.googletag = window.googletag || { cmd: [] };

googletag.cmd.push(function () {

    console.log("[GPT] Rewarded slot setup START...");

    if (rewardedAd) {
        console.log("[GPT] Rewarded slot already exists, skipping.");
        return;
    }

    rewardedAd = googletag.defineOutOfPageSlot(
        adsKeys.rewoarded_001,
        googletag.enums.OutOfPageFormat.REWARDED
    );

    if (!rewardedAd) {
        console.error("[GPT] ❌ Rewarded slot FAILED to create. Ad unit:", adsKeys.rewoarded_001);
        return;
    }

    console.log("[GPT] ✔ Rewarded slot DEFINED with unit:", adsKeys.rewoarded_001);

    rewardedAd.addService(googletag.pubads());

    /* READY EVENT – store makeRewardedVisible + notify listeners */
    googletag.pubads().addEventListener("rewardedSlotReady", function (evt) {
        if (evt.slot !== rewardedAd) return;
        console.log("[GPT] ✔✔✔ rewardedSlotReady FIRED! Reward is ready to show.");
        isRewardReady = true;
        showRewardedFn = evt.makeRewardedVisible;
        // Notify google-reward.js / others that reward is available
        try { window.dispatchEvent(new Event("gptRewardReady")); } catch (e) { }
    });

    /* IMPRESSION EVENT */
    googletag.pubads().addEventListener("rewardedSlotGranted", function (evt) {
        if (evt.slot !== rewardedAd) return;
        console.log("[GPT] 🎁 rewardedSlotGranted — Reward given to user!");
    });

    /* CLOSE EVENT */
    googletag.pubads().addEventListener("rewardedSlotClosed", function (evt) {
        if (evt.slot !== rewardedAd) return;
        console.log("[GPT] Rewarded slot CLOSED.");
        if (pendingUrl) {
            window.location.href = pendingUrl;
            pendingUrl = null;
        }
    });

    console.log("[GPT] Rewarded slot setup COMPLETE. Waiting for enableServices()...");

});


/*-------------- End ----------------------*/


var isRootOrIndexWithoutQuestionParam = () => {
    const { pathname, search } = window.location;
    const isCorrectPath =
        pathname === '/' || pathname === '/index.html';
    const hasNoQuestionParam = !new URLSearchParams(search).has('question');
    return isCorrectPath && hasNoQuestionParam;
};

/* ---------- SHOW REWARD WHEN USER CLICKS ---------- */
function showRewardAndGo(url) {
    console.log("[GPT] showRewardAndGo() called. isRewardReady:", isRewardReady, "url:", url);
    pendingUrl = url;

    if (isRewardReady && typeof showRewardedFn === "function") {
        console.log("[GPT] ✔ Showing Reward instantly...");
        try {
            showRewardedFn();
        } catch (err) {
            console.error("[GPT] ❌ Instant show error:", err);
            if (url) window.location.href = url;
        }
        return;
    }

    console.warn("[GPT] ⚠️ Reward NOT ready → redirecting directly.");
    if (url) window.location.href = url;
}

/* ---------- START (no-op: slot already defined above) ---------- */
function preloadReward() { /* rewarded slot defined at load time in head */ }
