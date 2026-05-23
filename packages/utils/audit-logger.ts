export interface AuditLogEntry {
	timestamp: string;
	level: "INFO" | "WARN" | "ERROR";
	event: string;
	details?: unknown;
}

export class AuditLogger {
	public log(
		event: string,
		level: "INFO" | "WARN" | "ERROR" = "INFO",
		details?: unknown,
	) {
		const entry: AuditLogEntry = {
			timestamp: new Date().toISOString(),
			level,
			event,
			details,
		};

		const logLine = JSON.stringify(entry);

		if (level === "ERROR") {
			process.stderr.write(`${logLine}\n`);
		} else {
			process.stdout.write(`${logLine}\n`);
		}
	}

	public rotate() {}
}

export const auditLogger = new AuditLogger();
