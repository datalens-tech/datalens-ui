import * as React from 'react';
import $ from 'jquery';
import Utils from 'ui/utils';
import {I18n} from 'i18n';

import '../../../styles/admin.scss';

const i18n = I18n.keyset('component.admin-pages');

var projects = [];

function cancelForm() {
  $('#dl-admin-form-loading').hide();

  $('#dl-admin-form').hide();
  $('#dl-admin-form').css({"width": "100%"});
  $('#dl-admin-list').css({"width": "0%"});

  setMessage();
}

function resetFormData() {
  $('#dl-admin-form input[name="id"]').val('');
  $('#dl-admin-form input[name="name"]').val('');
  $('#dl-admin-form input[name="description"]').val('');
}

function setMessage(msg) {
  if(msg) {
    $('#dl-admin-form-alert').show();
    $('#dl-admin-form-alert').html(msg);
  } else {
    $('#dl-admin-form-alert').hide();
    $('#dl-admin-form-alert').html('');
  }
}

async function updateTable() {
  var tbody = $("#projects-table tbody");
  tbody.html('');

  var table = $("#projects-table");

  projects = await Utils.universalService({"action": "datalens", "method": "projects", "data": [{}]});
  projects = projects.err ? [] : projects.data;

  $.each(projects, function(index, value) { 
    var btn = `<td><button type="button" class="btn btn-sm" data-item-id="${value.project_id}" data-item-base="${value.isbase}">Изменить</button></td>`;
    table.append(`<tr class="project-item">
                    <td>${value.project_id}</td>
                    <td>${value.description}</td>
                    <td>${value.name}</td>
                    <td>${value.isbase}</td>
                    ${value.isbase ? '<td>&nbsp;</td>' : btn}
                  </tr>`);
  });
}

class ProjectTables extends React.Component {
    constructor() {
      super();
    }
    
    async componentDidMount() {
        await updateTable();

        var table = $("#projects-table");

        table.on('click', 'tr.project-item button[data-item-base="false"]', (e) => {
          $('#dl-admin-form-title').text(i18n('change_project'));
          $('#dl-admin-form-success').text(i18n('change'));
          resetFormData();

          var id = e.currentTarget.getAttribute('data-item-id');
          if(id) {
            $('#dl-admin-form').show();
            $('#dl-admin-form').css({"width": "50%"});
            $('#dl-admin-list').css({"width": "50%"});
          }
          for(var i = 0; i < projects.length; i++) {
            var item = projects[i];
            if(item.project_id == parseInt(id)) {
              $('#project_item_id').val(item.project_id);
              $('#project_item_name').val(item.name);
              $('#project_item_description').val(item.description);
            }
          }
        })

        $('#dl-admin-form-cancel').on('click', (e) => {
          cancelForm();
        });

        $('#dl-admin-form-success').on('click', (e) => {
          setMessage();

          $('#dl-admin-form-loading').show();

          var values = {
            'id': $('#dl-admin-form input[name="id"]').val(),
            'c_name': $('#dl-admin-form input[name="name"]').val(),
            'c_description': $('#dl-admin-form input[name="description"]').val()
          };

          if(!values.c_name) {
            $('#dl-admin-form-loading').hide();
            return setMessage(i18n('const_require'));
          }

          if(!/[a-zA-Z0-1_]+/.test(values.c_name)) {
            $('#dl-admin-form-loading').hide();
            return setMessage(i18n('const_valid_name'));
          }

          Utils.universalService({"action": "datalens", "method": "add_or_update_project", "data": [values]}).then((value) => {
            if(value.err) {
              setMessage(value.err);
            } else {
              if(value.data[0] == true) {
                setMessage(i18n('record_updated'));
                
                updateTable().finally(() => {
                  cancelForm();
                })
              } else {
                setMessage(`${i18n('status')} ` + JSON.stringify(value.data[0]));
              }
            }
          }).catch((reason) => {
            setMessage(reason);
            cancelForm();
          });
        });

        $('#dl-admin-form-add').on('click', () => {
          $('#dl-admin-form-title').text(i18n('create_project'));
          $('#dl-admin-form-success').text(i18n('create'));
          resetFormData();

          $('#dl-admin-form').show();
          $('#dl-admin-form').css({"width": "50%"});
          $('#dl-admin-list').css({"width": "50%"});
        });
    }
    
    render() {
      return (
        <div className='dl-admin-layout'>
          <h1>{i18n("projects")}</h1>

          <div className="alert alert-light" role="alert">
            {i18n("alert_message")}
          </div>

          <div style={{"textAlign": "right"}}>
            <button type="button" className="btn btn-light" id="dl-admin-form-add">{i18n('create')}</button>
          </div>

          <table style={{"width": "100%"}}>
            <tbody>
              <tr>
                <td id="dl-admin-list" style={{"width": "100%", "verticalAlign": "top"}}>
                  <table id="projects-table" className="table table-hover">
                    <thead>
                        <tr>
                          <th scope="col">ID</th>
                          <th scope="col">{i18n("name")}</th>
                          <th scope="col">{i18n('constant')}</th>
                          <th scope="col">{i18n('is_base')}</th>
                          <th scope="col">{i18n('action')}</th>
                        </tr>
                    </thead>
                    <tbody>

                    </tbody>
                  </table>  
                </td>
                <td id="dl-admin-form" style={{"width": "0%", "display": "none", "verticalAlign": "top"}}>
                  <div className="container">
                    <h3 id="dl-admin-form-title">{i18n('edit_project')}</h3>
                    <div className="alert alert-danger" role="alert" id="dl-admin-form-alert" style={{"display": "none"}}>
                      
                    </div>
                    
                    <div id="dl-admin-form-loading" style={{"display": "none"}}>
                      {i18n('loading')}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="project_item_id" className="form-label">ID</label>
                      <input type="text" className="form-control" id="project_item_id" name="id" disabled readOnly />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="project_item_name" className="form-label">{i18n('constant')}</label>
                      <input type="text" className="form-control" id="project_item_name" name='name'/>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="project_item_name" className="form-label">{i18n('name')}</label>
                      <input type="text" className="form-control" id="project_item_description" name='description' />
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

export default ProjectTables;
