import * as React from 'react';
import $ from 'jquery';
import Utils from 'ui/utils';
import {I18n} from 'i18n';

const i18n = I18n.keyset('component.roles');

class RoleTables extends React.Component {
    constructor() {
      super();
    }
    
    async componentDidMount() {
        var table = $("#roles-table");

        var roles = await Utils.getRoles({});

        $.each(roles, function(index, value) { 

        });

        debugger;
        table.append('<tr><td>Test</td></tr>');
    }
    
    render() {
      return (
        <div>
            <table id="roles-table" className="table">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">{i18n("name")}</th>
                    <th scope="col">Last</th>
                    <th scope="col">Handle</th>
                    </tr>
                </thead>
                <tbody>

                </tbody>
            </table>
        </div>
      )
    }
}

export default RoleTables;
