function FollowerTabs() {
    var linksArr=document.getElementsByTagName("a");
    for (i=0;i<linksArr.length;i++) {
        linksArr[i].setAttribute("target","followertab");
    }
}
if (document.readyState==='complete') {
    FollowerTabs();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        FollowerTabs();
    });
}
