import { env } from 'process';
import { CronJob } from 'cron';
import { postAggregatedWalletInRabChannel, startApp } from './slack/app';

const registerCronJobs = (): void => {
  const cronTimezone: string = env.CRON_TIMEZONE || '';

  const frequentReporting: boolean = 'true' === env.FREQUENT_REPORTING;
  if (frequentReporting) {
    const frequentReportingCronTime: string = env.FREQUENT_REPORTING_CRON_TIME || '';

    new CronJob(
      frequentReportingCronTime, 
      async (): Promise<void> => {
        await postAggregatedWalletInRabChannel()
      },
      null,
      true,
      cronTimezone,
    );

    console.info('Frequent reporting enabled');
  }
};

(async () => {
  await startApp();
  registerCronJobs();
})();
