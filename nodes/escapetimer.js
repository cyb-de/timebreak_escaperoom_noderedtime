module.exports = function(RED) {
    function TbTimerNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const initialSeconds = parseInt(config.duration, 10) * 60;
        let currentSeconds = initialSeconds;
        let overtime = false;
        let timer = null;

        function formatTime(sec) {
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            return `${m}:${s < 10 ? '0' + s : s}`;
        }

        function startTimer() {
            if (timer) return;
            timer = setInterval(() => {
                if (!overtime) {
                    if (currentSeconds > 0) {
                        currentSeconds--;
                    } else {
                        overtime = true;
                        currentSeconds = 0;
                    }
                } else {
                    currentSeconds++;
                }
                node.send({
                    payload: {
                        time: formatTime(currentSeconds),
                        overtime: overtime
                    }
                });
            }, 1000);
        }

        function stopTimer() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function resetTimer() {
            stopTimer();
            currentSeconds = initialSeconds;
            overtime = false;
            startTimer();
        }

        // start immediately
        startTimer();

        node.on('input', (msg) => {
            const cmd = (msg.payload || '').toString().trim().toUpperCase();
            switch (cmd) {
                case 'PAUSE': stopTimer(); break;
                case 'START': startTimer(); break;
                case 'RESET': resetTimer(); break;
                case 'STOP':  stopTimer(); break;
            }
        });

        node.on('close', stopTimer);
    }

    RED.nodes.registerType('escapetimer', TbTimerNode, {
        category: 'function',
        color: '#ccffcc',
        defaults: {
            name:     { value: "" },
            duration: { value: "60" }
        },
        inputs:  1,
        outputs: 1,
        icon:    'font-awesome/fa-clock-o',
        label:   function() { return this.name || 'escapetimer'; }
    });
};
