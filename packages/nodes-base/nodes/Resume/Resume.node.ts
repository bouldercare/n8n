import type { IExecuteFunctions, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';

import { Node } from 'n8n-workflow';

export class Resume extends Node {
	description: INodeTypeDescription = {
		displayName: 'Resume',
		name: 'resume',
		icon: 'fa:play-circle',
		group: ['organization'],
		version: 1,
		description: 'Resume a workflow in the "waiting" status',
		defaults: {
			name: 'Resume',
			color: '#804050',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Execution',
				name: 'execution',
				type: 'options',
				options: [
					{
						name: 'By Execution ID',
						value: 'executionId',
						description: 'Identify the execution to resume by Execution ID',
					},
					{
						name: 'By Resume ID',
						value: 'resumeId',
						description:
							"Identify the execution(s) to resume by the Resume ID set in the execution's Wake Node",
					},
				],
				default: 'executionId',
				description: 'How to identify the execution to resume',
			},
			{
				displayName: 'Execution ID',
				name: 'executionId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						execution: ['executionId'],
					},
				},
				default: '',
			},
			{
				displayName: 'Resume ID',
				name: 'resumeId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						execution: ['resumeId'],
					},
				},
				default: '',
			},
			{
				displayName: 'Resume',
				name: 'resume',
				type: 'options',
				options: [
					{
						name: 'Now',
						value: 'now',
						description: 'Resumes the workflow execution immediately',
					},
					{
						name: 'After Time Interval',
						value: 'timeInterval',
						description: 'Updates the workflow execution to resume after a certain amount of time',
					},
					{
						name: 'At Specified Time',
						value: 'specificTime',
						description: 'Updates the workflow execution to resume at a specific date and time',
					},
					{
						name: 'Never',
						value: 'never',
						description: 'Cancels the workflow execution so it never resumes',
					},
				],
				default: 'now',
				description: 'Determines when the workflow execution should resume',
			},
			// ----------------------------------
			//         resume:specificTime
			// ----------------------------------
			{
				displayName: 'Date and Time',
				name: 'dateTime',
				type: 'dateTime',
				displayOptions: {
					show: {
						resume: ['specificTime'],
					},
				},
				default: '',
				description: 'The date and time to wait for before continuing',
			},

			// ----------------------------------
			//         resume:timeInterval
			// ----------------------------------
			{
				displayName: 'Wait Amount',
				name: 'amount',
				type: 'number',
				displayOptions: {
					show: {
						resume: ['timeInterval'],
					},
				},
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				default: 1,
				description: 'The time to wait',
			},
			{
				displayName: 'Wait Unit',
				name: 'unit',
				type: 'options',
				displayOptions: {
					show: {
						resume: ['timeInterval'],
					},
				},
				options: [
					{
						name: 'Seconds',
						value: 'seconds',
					},
					{
						name: 'Minutes',
						value: 'minutes',
					},
					{
						name: 'Hours',
						value: 'hours',
					},
					{
						name: 'Days',
						value: 'days',
					},
				],
				default: 'hours',
				description: 'The time unit of the Wait Amount value',
			},
		],
	};

	async execute(context: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const waitTill: Date | null = this.getWaitTill(context);
		if (waitTill) {
			const execution: string = context.getNodeParameter('execution', 0) as string;
			if (execution === 'executionId') {
				const executionId = context.getNodeParameter('executionId', 0) as string;
				await context.resumeExecution({ executionId }, waitTill);
			} else if (execution === 'resumeId') {
				const resumeId = context.getNodeParameter('resumeId', 0) as string;
				await context.resumeExecution({ resumeId }, waitTill);
			}
		} else {
			// TODO cancel execution by setting status to canceled
		}

		return [context.getInputData()];
	}

	private getWaitTill(context: IExecuteFunctions): Date | null {
		const resume = context.getNodeParameter('resume', 0) as string;
		if (resume === 'timeInterval') {
			const unit = context.getNodeParameter('unit', 0) as string;

			let waitAmount = context.getNodeParameter('amount', 0) as number;
			if (unit === 'minutes') {
				waitAmount *= 60;
			}
			if (unit === 'hours') {
				waitAmount *= 60 * 60;
			}
			if (unit === 'days') {
				waitAmount *= 60 * 60 * 24;
			}

			waitAmount *= 1000;

			return new Date(new Date().getTime() + waitAmount);
		} else if (resume === 'specificTime') {
			const dateTime = context.getNodeParameter('dateTime', 0) as string;
			return new Date(dateTime);
		} else if (resume === 'now') {
			return new Date();
		} else {
			return null;
		}
	}
}
