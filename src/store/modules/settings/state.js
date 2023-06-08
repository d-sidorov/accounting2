export default {
  settings: {
    // infoToComments: false,
    stages: [{
      start: {
        category: { ID: null, NAME: null },
        stage: { NAME: null, STATUS_ID: null }
      },
      end: {
        category: { ID: null, NAME: null },
        stage: { NAME: null, STATUS_ID: null }
      }
    }],
    usersSettingsRights: [],
    usersAddRights: [],
    exceptionList: [],
    version: '1.0'
  },
  categories: [],
  stages: {},
  measures: {},
  users: [{ ID: null, NAME: null }],
  currentUser: null,
  // handler: "https://uchet.tovarov.simbirbit.ru/newbackup/#/deal",
  // fieldHandler: "https://uchet.tovarov.simbirbit.ru/newbackup/#/field",
  handler: "https://uchet.tovarov.simbirbit.ru/test_uchetv2/#/deal",
  fieldHandler: "https://uchet.tovarov.simbirbit.ru/test_uchetv2/#/field",
  // handler: "https://uchet.tovarov.simbirbit.ru/uchet_vue/dist/spa/#/deal",
  // fieldHandler: "https://uchet.tovarov.simbirbit.ru/uchet_vue/dist/spa/#/field",
  // handler: "https://uchet.tovarov.simbirbit.ru/uchet2.0/#/deal",
  // fieldHandler: "https://uchet.tovarov.simbirbit.ru/uchet2.0/#/field",
};
