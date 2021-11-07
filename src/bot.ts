import { env } from 'process';
import { CronJob } from 'cron';
import { postAggregatedWalletInRabChannel, startApp } from './slack/app';
import axios from 'axios';

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

  const keepAppAwake: boolean = 'true' === env.KEEP_APP_AWAKE;
  if(keepAppAwake) {
    const keepAppAwakeCronTime: string = env.KEEP_APP_AWAKE_CRON_TIME || '';
    const appUrl: string = env.APP_URL || '';

    new CronJob(
      keepAppAwakeCronTime, 
      async (): Promise<void> => {
        await axios.get(appUrl);
      },
      null,
      true,
      cronTimezone,
    );

    console.info('Keep app awake enabled');
  }
};

(async () => {
  await startApp();
  registerCronJobs();
})();
