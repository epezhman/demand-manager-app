'use strict';

const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

const storage = require('electron-json-storage');
var AutoLaunch = require('auto-launch');
const env = remote.require('./env.js');

document.addEventListener('DOMContentLoaded', ()=> {

    var run_at_start_up = document.getElementById('run-at-start-up');
    var limited_activity = document.getElementById('limited-activity');
    var limited_activity_start_time = document.getElementById('limited-activity-start-time');
    var limited_activity_end_time = document.getElementById('limited-activity-end-time');
    var ent_time_error = document.getElementById('end-time-error');
    var appLauncher = new AutoLaunch({
        name: env.envVar.productName
    });

    Array.from(document.getElementsByClassName('nav-group-item')).forEach((manager_menu_item) => {
        manager_menu_item.addEventListener("click", (e)=> {
            Array.from(document.getElementsByClassName('manager-pane')).forEach((manager_pane) => {
                manager_pane.style.display = 'none';
            });
            document.getElementById(manager_menu_item.dataset.managerPaneId).style.display = 'inline';
            Array.from(document.getElementsByClassName('nav-group-item')).forEach((menu_item_to_remove_active) => {
                menu_item_to_remove_active.classList.remove('active');
            });
            manager_menu_item.classList.add('active');
        });
    });

    ipc.on('this-tab-to-show', (event, arg)=> {
        document.getElementById(arg).click();
    });

    storage.get('run-on-start-up', (error, data) => {
        if (data.run)
            run_at_start_up.checked = 'checked';
    });

    run_at_start_up.addEventListener("click", (e)=> {
        if (run_at_start_up.checked) {
            appLauncher.isEnabled().then((enabled) => {
                if (enabled) return;
                return appLauncher.enable();
            }).then((enabled) => {
                storage.set('run-on-start-up', {run: true}, (error)=> {
                });
            });
        }
        else {
            appLauncher.isEnabled().then((enabled)=> {
                if (enabled)
                    return appLauncher.disable();
            }).then((disabled)=> {
                storage.set('run-on-start-up', {run: false}, (error) => {
                });
            });
        }
    });

    storage.has('limited-activity', (error, hasKey)=> {
        if (!hasKey) {
            limited_activity.checked = 'checked';
        }
        else {
            limited_activity_start_time.removeAttribute('disabled');
            limited_activity_end_time.removeAttribute('disabled');
        }
    });

    limited_activity.addEventListener("click", (e) => {
        if (limited_activity.checked) {
            storage.remove('limited-activity', (error) => {
            });
            storage.remove('limited-activity-start-time', (error)=> {
                limited_activity_start_time.value = 0;
                limited_activity_start_time.disabled = 'disabled';
            });
            storage.remove('limited-activity-end-time', (error)=> {
                limited_activity_end_time.value = 24;
                limited_activity_end_time.disabled = 'disabled';
            });
        }
        else {
            storage.set('limited-activity', {limited: true}, (error) => {
                limited_activity_start_time.removeAttribute('disabled');
                limited_activity_end_time.removeAttribute('disabled');
            });
        }
    });

    storage.has('limited-activity-start-time', (error, hasKey)=> {
        if (hasKey) {
            storage.get('limited-activity-start-time', (error, data) => {
                if (data.limited_start_time)
                    limited_activity_start_time.value = data.limited_start_time;
            });
        }
    });

    storage.has('limited-activity-end-time', (error, hasKey)=> {
        if (hasKey) {
            storage.get('limited-activity-end-time', (error, data)=> {
                if (data.limited_end_time)
                    limited_activity_end_time.value = data.limited_end_time;
            });
        }
    });

    var checkEndTimeValidation = () => {
        var start_time = limited_activity_start_time.options[limited_activity_start_time.selectedIndex].value;
        var end_time = limited_activity_end_time.options[limited_activity_end_time.selectedIndex].value;
        if (parseInt(start_time) >= parseInt(end_time)) {
            ent_time_error.style.display = 'inline';
            return false;
        }
        ent_time_error.style.display = 'none';
        return true;
    };

    limited_activity_start_time.addEventListener("change", (e)=> {
        if (checkEndTimeValidation())
            storage.set('limited-activity-start-time', {
                limited_start_time: limited_activity_start_time.options[limited_activity_start_time.selectedIndex].value
            }, (error) => {
            });
    });

    limited_activity_end_time.addEventListener("change", (e) => {
        if (checkEndTimeValidation())
            storage.set('limited-activity-end-time', {
                limited_end_time: limited_activity_end_time.options[limited_activity_end_time.selectedIndex].value
            }, (error)=> {
            });
    });

});
