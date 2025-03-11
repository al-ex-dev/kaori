import { exec } from "child_process";
import os from "os";
import si from "systeminformation";
import { promisify } from "util";
import { convertTimeOut } from "@nazi-team/baileys";

const execAsync = promisify(exec);

const formatGB = bytes => (bytes / 1024 ** 3).toFixed(2);
const formatMB = bytes => (bytes / 1024 ** 2).toFixed(2);

export default {
    name: 'status',
    desc: 'Muestra el estado del sistema y procesos activos de PM2',
    comand: ['status'],
    exec: async (m, { sock }) => {
        const [system, osInfo, cpu, mem, disk, temp] = await Promise.all([
            si.system(),
            si.osInfo(),
            si.cpu(),
            si.mem(),
            si.fsSize(),
            si.cpuTemperature()
        ]);

        const systemStats = `
*Sistema*: ${osInfo.distro} ${osInfo.release} (${os.arch()})
*CPU*: ${cpu.manufacturer} ${cpu.brand} (${cpu.cores} núcleos)
*Temperatura*: ${temp.main || 'N/A'}°C
*Memoria*: ${formatGB(mem.total)}GB Total | ${formatGB(mem.free)}GB Libre
*Almacenamiento*: ${formatGB(disk[0]?.size || 0)}GB Total | ${formatGB(disk[0]?.used || 0)}GB Usado
*Uptime*: ${convertTimeOut(os.uptime() * 1000)}
            `.trim().split('\n').map(l => l.trim()).join('\n');

        const { stdout } = await execAsync('pm2 jlist');
        const processes = JSON.parse(stdout).map(p => {
            const { name, pm_id, pid, pm2_env, monit } = p;
            const uptime = ((Date.now() - pm2_env.pm_uptime) / 1000).toFixed(0);

            return `🤖 *${name}* [${pm_id}]
PID: ${pid}
Status: ${pm2_env.status}
CPU: ${monit.cpu}%
RAM: ${formatMB(monit.memory)}MB
Uptime: ${convertTimeOut(uptime * 1000)}
Node: ${pm2_env.node_version} | v${pm2_env.version}s`
        }).join('\n\n');

        await sock.sendMessage(m.from, {
            text: `*ESTADO DEL SISTEMA*\n\n${systemStats}\n\n*PROCESOS ACTIVOS*\n\n${processes}`,
            mentions: [m.sender]
        }, { quoted: m });


    },
    isOwner: true
}