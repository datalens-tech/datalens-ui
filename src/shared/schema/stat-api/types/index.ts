export type CheckStatReportExistsResponse =
    | {
          exists: true;
          _path: string;
      }
    | {
          exists: false;
          reason: null | string;
          dir_exists: boolean;
      };

export type CheckStatReportExistsArgs = {
    name: string;
};
