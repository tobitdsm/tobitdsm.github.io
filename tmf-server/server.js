function update(status, console) {
    console = document.getElementById("console").firstElementChild.innerHTML.slice(0, -1) + console;
    console = console.split("<br>").slice(-20);
    document.getElementById("console").firstElementChild.innerHTML = console.join("<br>") + "_";
    document.getElementById("control").firstElementChild.firstElementChild.innerHTML = "Server status:" + status;
}

function server_start() {
    let cmd = "start";
    update("🟢<br class=\"only-mobile\">starting", cmd + "<br>");
    command(cmd).then();
}

function server_stop() {
    let cmd = "stop";
    update("🔴<br class=\"only-mobile\">stopping", cmd + "<br>");
    command(cmd).then();
}

function server_restart() {
    let cmd = "restart";
    update("🔁<br class=\"only-mobile\">restarting", cmd + "<br>");
    command(cmd).then();
}

function server_refresh() {
    let cmd = "status";
    update("🔃<br class=\"only-mobile\">refreshing", cmd + "<br>");
    command(cmd).then();
}

async function command(cmd) {
    let res = await send_command("/etc/init.d/tmfd " + cmd);
    if (typeof res !== "object") update(" ⚡ <br class=\"only-mobile\">unreachable", res + "<br>> ");
    else if (res['message'] === "") update(" ⚡ <br class=\"only-mobile\">unreachable", res['message'] + "<br>> ");
    else if (res['message'] === "Stopping tmfd (via systemctl): tmfd.service.") update("🔴<br class=\"only-mobile\">stopping", res['message'] + "<br>> ");
    else if (res['message'] === "Starting tmfd (via systemctl): tmfd.service.") update("🟢<br class=\"only-mobile\">starting", res['message'] + "<br>> ");
    else if (res['message'] === "Restarting tmfd (via systemctl): tmfd.service.") update("🔁<br class=\"only-mobile\">restarting", res['message'] + "<br>> ");
    else if (res['message'].split("\n") > 1) {
        if (res['message'].split("\n")[2].trim().startsWith("Active: inactive (dead)")) update("⭕<br class=\"only-mobile\">offline", res['message'] + "<br>> ");
        else if (res['message'].split("\n")[2].trim().startsWith("Active: active (running)")) update("🟢<br class=\"only-mobile\">online", res['message'] + "<br>> ");
    }
    else update("❔unknown", res['message'] + "<br>> ");
}

async function send_command(cmd, timeout = 5000) {
    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            controller.abort();
            reject(new Error('Request timed out'));
        }, timeout);
    });

    const fetchPromise = fetch('http://127.0.0.1:5000/tmfd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cmd }),
        signal,
    });

    try {
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        return await response.json();
    } catch (error) {
        return error.toString();
    }
}
