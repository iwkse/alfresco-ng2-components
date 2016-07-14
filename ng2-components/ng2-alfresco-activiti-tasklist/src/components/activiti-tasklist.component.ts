/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Input } from '@angular/core';
import { AlfrescoTranslationService, AlfrescoAuthenticationService } from 'ng2-alfresco-core';
import { ALFRESCO_DATATABLE_DIRECTIVES, ObjectDataTableAdapter, DataTableAdapter } from 'ng2-alfresco-datatable';
import { ActivitiTaskListService } from './../services/activiti-tasklist.service';


declare let componentHandler: any;
declare let __moduleName: string;

@Component({
    selector: 'activiti-tasklist',
    moduleId: __moduleName,
    templateUrl: './activiti-tasklist.component.html',
    directives: [ALFRESCO_DATATABLE_DIRECTIVES],
    providers: [ActivitiTaskListService]

})
export class ActivitiTaskList {

    tasks: ObjectDataTableAdapter;

    @Input()
        data: DataTableAdapter;

    @Input()
        assignment: string;

    /**
     * Constructor
     * @param auth
     * @param translate
     */
    constructor(private auth: AlfrescoAuthenticationService,
                private translate: AlfrescoTranslationService,
                private activiti: ActivitiTaskListService) {

        translate.addTranslationFolder('node_modules/ng2-alfresco-activiti-tasklist');

        if (auth.isLoggedIn('BPM')) {
            activiti.getTaskListFilters().subscribe((resFilter) => {
                let tasksListFilter = resFilter.data || [];
                if (tasksListFilter.length === 0) {
                    activiti.createMyTaskFilter().subscribe(() => {
                        console.log('Default filters created');
                    });
                    activiti.getTasks(this.assignment).subscribe((res) => {
                        let tasks = res.data || [];
                        console.log(tasks);
                        this.loadTasks(tasks);
                    });
                }
            });
        } else {
            console.error('User unauthorized');
        }
    }

    /**
     * The method call the adapter data table component for render the task list
     * @param tasks
     */
    private loadTasks(tasks: any[]) {
        tasks = this.optimizeTaskName(tasks);
        this.tasks = new ObjectDataTableAdapter(tasks, this.data.getColumns());
    }

    private optimizeTaskName(tasks: any[]) {
        tasks = tasks.map(t => {
            t.name = t.name || 'Nameless task';
            if (t.name.length > 50) {
                t.name = t.name.substring(0, 50) + '...';
            }
            return t;
        });
        return tasks;
    }
}