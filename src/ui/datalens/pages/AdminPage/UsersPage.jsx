import * as React from 'react';
import $ from 'jquery';
import Utils from 'ui/utils';
import {I18n} from 'i18n';

import '../../../styles/admin.scss';

const i18n = I18n.keyset('component.admin-pages');

var users = [];
var roles = [];
var projects = [];

function cancelForm() {
  $('#dl-admin-loading').hide();

  $('#dl-admin-form').hide();
  $('#dl-admin-form').css({"width": "100%"});
  $('#dl-admin-list').css({"width": "0%"});

  setErrorMessage();
  setMessage('');
}

function resetFormData() {
  $('#dl-admin-form input[name="id"]').val('');
  $('#dl-admin-form input[name="c_login"]').val('');
  $('#dl-admin-form input[name="c_email"]').val('');
  $('#dl-admin-form input[name="c_password"]').val('');
  fillClaims('');
  $('#dl-admin-form input[name="b_disabled"]').prop('checked', false);
}

function setErrorMessage(msg) {
  if(msg) {
    $('#dl-admin-form-warning').show();
    $('#dl-admin-form-warning').html(msg);
  } else {
    $('#dl-admin-form-warning').hide();
    $('#dl-admin-form-warning').html('');
  }
}

function setMessage(msg) {
  if(msg) {
    $('#dl-admin-form-message').show();
    $('#dl-admin-form-message').html(msg);
  } else {
    $('#dl-admin-form-message').hide();
    $('#dl-admin-form-message').html('');
  }
}

function fillProjects(c_project) {
  // заполняем список проект
  $('#dl-admin-form-project').empty();

  $.each(projects, function (i, item) {
    $('#dl-admin-form-project').append($('<option>', { 
        value: item.name,
        text : item.name 
    }));
  });

  $('#dl-admin-form-project').val([c_project]);
}

function fillClaims(c_claims) {
  // заполняем список ролей
  $('#dl-admin-form-claims').empty();

  $.each(roles, function (i, item) {
    $('#dl-admin-form-claims').append($('<option>', { 
        value: item.name,
        text : item.name 
    }));
  });

  var selectedClaims = c_claims.split('.').filter((i) =>{ return i; });
  $('#dl-admin-form-claims').val(selectedClaims);
}

function validClaims() {
  var claims = $('#dl-admin-form-claims').val();
  if(claims.length == 0) {
    return setErrorMessage(i18n('no_selected_roles'));
  }

  var requires_claims = ['admin', 'datalens'];
  var valid = false;

  for(var i = 0; i < claims.length; i++) {
    for(var j = 0; j < requires_claims.length; j++) {
      if(claims[i] == requires_claims[j]) {
        valid= true;
        break;
      }
    }

    if(valid) {
      break;
    }
  }

  if(!valid) {
    return setErrorMessage(`${i18n('not_select_require_roles')} ` + requires_claims.join(', '));
  }

  return claims;
}

async function updateTable(txt) {
  var tbody = $("#users-table tbody");
  tbody.html('');

  var table = $("#users-table");

  users = await Utils.users({filter: txt});

  $.each(users, function(index, value) { 
    var btn = `<td><button type="button" class="btn btn-link btn-sm" data-item-id="${value.id}" data-item-base="${value.b_base}">${i18n('change')}</button></td>`;
    table.append(`<tr class="user-item ${value.b_disabled ? "table-secondary" : ""}">
                    <td>${value.id}</td>
                    <td>${value.c_login}</td>
                    <td>${value.c_claims}</td>
                    <td>${value.c_project_name}</td>
                    ${value.b_base ? '<td>&nbsp;</td>' : btn}
                  </tr>`);
  });
}

class UserTables extends React.Component {
    constructor() {
      super();
    }
    
    async componentDidMount() {
        await updateTable();

        roles = await Utils.getRoles({});
        projects = await Utils.projects({});

        var table = $("#users-table");

        // кнопка изменить
        table.on('click', 'tr.user-item button[data-item-base="false"]', (e) => {
          $('#dl-admin-form-title').text(i18n('change_user'));
          $('#dl-admin-form-success').text(i18n('change'));

          $('#user_item_disabled').prop('disabled', false);
          $('#dl-admin-form-change-claims').show();
          $('#dl-admin-form-change-password').show();

          resetFormData();

          var id = e.currentTarget.getAttribute('data-item-id');
          if(id) {
            $('#dl-admin-form').show();
            $('#dl-admin-form').css({"width": "50%"});
            $('#dl-admin-list').css({"width": "50%"});
          }

          for(var i = 0; i < users.length; i++) {
            var item = users[i];

            if(item.id == parseInt(id)) {
              $('#user_item_id').val(item.id);
              $('#user_item_login').val(item.c_login);
              $('#user_item_email').val(item.c_email);
              $('#user_item_claims').val(item.c_claims);
              $('#user_item_disabled').prop('checked', item.b_disabled);
              break;
            }
          }

          fillClaims(item.c_claims);
          fillProjects(item.c_project_name);
        })

        $('#dl-admin-form-cancel').on('click', (e) => {
          cancelForm();
        });

        $('#dl-admin-form-success').on('click', (e) => {
          setErrorMessage();

          $('#dl-admin-loading').show();

          var values = {
            'id': $('#dl-admin-form input[name="id"]').val(),
            'c_login': $('#dl-admin-form input[name="c_login"]').val(),
            'c_email': $('#dl-admin-form input[name="c_email"]').val(),
            'c_password': $('#dl-admin-form input[name="c_password"]').val(),
            'c_claims': $('#dl-admin-form select[name="c_claims"]').val(),
            'b_disabled': $('#dl-admin-form input[name="b_disabled"]').prop('checked'),
            'c_project_name': $('#dl-admin-form select[name="c_project_name"]').val(),
          };

          if(!values.c_login) {
            $('#dl-admin-loading').hide();
            return setErrorMessage(i18n('require_login'));
          }

          if(!/[a-zA-Z0-9_]+/.test(values.c_login)) {
            $('#dl-admin-loading').hide();
            return setErrorMessage(i18n('login_valid_name'));
          }

          var claims = validClaims();
          if(!claims) {
            return;
          }
          values.c_claims = claims;

          (values.id ? Utils.updateUser : Utils.createUser)(values).then((value) => {
            if(value.err) {
              setErrorMessage(value.err);
            } else {
              if(value.data[0] == true) {
                updateTable().finally(() => {
                  cancelForm();
                })
              } else {
                setErrorMessage(value.data[0].message);
              }
            }
          }).catch((reason) => {
            setErrorMessage(reason);
            cancelForm();
          });
        });

        // добавить пользователя
        $('#dl-admin-form-add').on('click', () => {
          $('#dl-admin-form-title').text(i18n('create_user'));
          $('#dl-admin-form-success').text(i18n('create'));

          $('#user_item_disabled').prop('disabled', true);
          $('#dl-admin-form-change-claims').hide();
          $('#dl-admin-form-change-password').hide();

          resetFormData();

          $('#dl-admin-form').show();
          $('#dl-admin-form').css({"width": "50%"});
          $('#dl-admin-list').css({"width": "50%"});

          fillProjects('');
        });

        // обновление списка
        $('#dl-admin-form-refresh').on('click', () => { 
          $('#dl-admin-loading').show();
          updateTable().finally(() => {
            $('#dl-admin-loading').hide();
          });
        });

        // изменить пароль
        $('#dl-admin-form-change-password').on('click', () => { 

          var login = $('#user_item_login').val();
          if(!login) {
            return setErrorMessage(i18n('login_empty'));
          }

          var pwd = $('#user_item_password').val();
          if(!pwd) {
            return setErrorMessage(i18n('password_empty'));
          }

          $('#dl-admin-loading').show();

          Utils.passwordReset({"c_login": login, "c_password": pwd}).then((value) => {
            if(value.err) {
              return setErrorMessage(value.err);
            }

            if(value.data[0]) {
              $('#user_item_password').val('');

              var timer = setTimeout(() => {
                setMessage("");
                clearTimeout(timer);
              }, 3000);

              return setMessage(value.data[0]);
            }
          }).catch((reason) => {
            return setErrorMessage(reason);
          }).finally(() => {
            $('#dl-admin-loading').hide();
          });
        });

        // изменить роли
        $('#dl-admin-form-change-claims').on('click', () => { 
          var claims = validClaims();

          var id = $('#user_item_id').val();

          if(!id) {
            return setErrorMessage(i18n('id_empty'));
          }

          $('#dl-admin-loading').show();

          Utils.updateRoles({"id": id, "c_claims": claims}).then((value) => {
            if(value.err) {
              return setErrorMessage(value.err);
            }

            if(value.data[0]) {
              $('#dl-admin-form-claims').val([]);

              var timer = setTimeout(() => {
                setMessage("");
                clearTimeout(timer);
              }, 3000);

              updateTable().finally(() => {
                $('#dl-admin-loading').hide();
              });

              return setMessage(value.data[0]);
            } else {
              $('#dl-admin-loading').hide();
            }
          }).catch((reason) => {
            $('#dl-admin-loading').hide();
            return setErrorMessage(reason);
          });
          
        });

        $('#dl-admin-form-change-search').on('click', ()=>{
          var text = $('#user_item_search').val();

          $('#dl-admin-loading').show();
          updateTable(text).finally(() => {
            $('#dl-admin-loading').hide();
          });
        });
    }
    
    render() {
      return (
        <div className='dl-admin-layout'>
          <h1>{i18n("users")}</h1>

          <div className="alert alert-light" role="alert">
            {i18n("alert_message")}
          </div>

          <div id="dl-admin-loading" style={{"display": "none"}}>
            {i18n('loading')}
          </div>

          <div style={{"textAlign": "right"}}>
            <div className="input-group mb-3">
              <input name='c_search' id="user_item_search" type="text" className="form-control" placeholder={i18n('search_part')} aria-label={i18n('search')} aria-describedby="dl-admin-form-change-search" />
              <button className="btn btn-outline-secondary" type="button" id="dl-admin-form-change-search">{i18n('search')}</button>

              <button type="button" className="btn btn-outline-secondary" id="dl-admin-form-add">{i18n('create')}</button>
              <button type="button" className="btn btn-outline-secondary" id="dl-admin-form-refresh">{i18n('refresh')}</button>
            </div>

          </div>

          <table style={{"width": "100%"}}>
            <tbody>
              <tr>
                <td id="dl-admin-list" style={{"width": "100%", "verticalAlign": "top"}}>
                  <table id="users-table" className="table table-hover">
                    <thead>
                        <tr>
                          <th scope="col">ID</th>
                          <th scope="col">{i18n("login")}</th>
                          <th scope="col">{i18n('roles')}</th>
                          <th scope="col">{i18n('project')}</th>
                          <th scope="col">{i18n('action')}</th>
                        </tr>
                    </thead>
                    <tbody>

                    </tbody>
                  </table>  
                </td>
                <td id="dl-admin-form" style={{"width": "0%", "display": "none", "verticalAlign": "top"}}>
                  <div className="container">
                    <h3 id="dl-admin-form-title">{i18n('edit_role')}</h3>
                    <div className="alert alert-danger" role="alert" id="dl-admin-form-warning" style={{"display": "none"}}>
                      
                    </div>

                    <div className="alert alert-success" role="alert" id="dl-admin-form-message" style={{"display": "none"}}>
                      
                    </div>

                    <div className="mb-3">
                      <label htmlFor="user_item_id" className="form-label">ID</label>
                      <input type="text" className="form-control" id="user_item_id" name="id" disabled readOnly />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="user_item_login" className="form-label">{i18n('login')}</label>
                      <input type="text" className="form-control" id="user_item_login" name='c_login'/>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="user_item_email" className="form-label">Email</label>
                      <input type="text" className="form-control" id="user_item_email" name='c_email' />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="dl-admin-form-project" className="form-label">{i18n('projects')}</label>
                      <select className="form-select" id="dl-admin-form-project" aria-label={i18n('projects')} name='c_project_name'>
                      </select>
                    </div>

                    { 
                    // пароль 
                    }
                    <div className="mb-3">
                      <div className="input-group mb-3">
                        <input name='c_password' id="user_item_password" type="password" className="form-control" placeholder={i18n('password')} aria-label={i18n('password')} aria-describedby="dl-admin-form-change-password" />
                        <button className="btn btn-outline-secondary" type="button" id="dl-admin-form-change-password">{i18n('change')}</button>
                      </div>
                    </div>

                    { 
                    // роли 
                    }
                    <div className="mb-3">
                      <div className="input-group">
                        <select className="form-select" id="dl-admin-form-claims" aria-label={i18n('roles')} multiple="multiple" name='c_claims'>
                        </select>
                        <button className="btn btn-outline-secondary" type="button" id="dl-admin-form-change-claims">{i18n('change')}</button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" value="" id="user_item_disabled" name='b_disabled' />
                        <label className="form-check-label" htmlFor="user_item_disabled">
                          {i18n("disabled")}
                        </label>
                      </div>
                    </div>

                    <div style={{"textAlign": "right"}}>
                      <button type="button" className="btn btn-primary" id='dl-admin-form-success'>{i18n('change')}</button> &nbsp;
                      <button type="button" className="btn btn-light" id='dl-admin-form-cancel'>{i18n('cancel')}</button>
                    </div>
                    
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }
}

export default UserTables;
