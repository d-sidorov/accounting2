export default {
  //настройки
  addSettings(state, settings) {
    if (settings.length == 0) return;
    //обработка параметров
    if(!settings.hasOwnProperty('hasEditBalance')){
      settings.hasEditBalance = false;
    }
    for (let key in settings) {
      if (['usersSettingsRights', 'usersAddRights', 'exceptionList'].includes(key) && !!!settings[key]) {
        settings[key] = [];
      } else if (['true', 'false'].includes(settings[key])) {
        if (settings[key] == 'true') settings[key] = true;
        else settings[key] = false;
      }
    }
    state.settings = settings;
  },
  //направления сделок
  addCategories(state, categories) {
    state.categories = categories;
  },
  //стадии сделок
  addStages(state, {category_id, stages}) {
    state.stages = {...state.stages, [category_id]: stages};
  },
  //пользователи
  addUsers(state, users) {
    state.users = users;
  },
  //текущий пользователь
  addCurrentUser(state, user) {
    state.currentUser = user;
  },
  //единицы измерения
  addMeasures(state, measures) {
    state.measures = measures;
  }
}