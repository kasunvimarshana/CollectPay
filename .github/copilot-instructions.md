- [ ] Verify that the copilot-instructions.md file in the .github directory is created.

- [ ] Clarify Project Requirements
	- Ask for project type, language, and frameworks if not specified.

- [ ] Scaffold the Project
	- Ensure previous step is completed.
	- Call project setup tool with `projectType`.
	- Run scaffolding command using `.` as the working directory.

- [ ] Customize the Project
	- Verify previous steps are complete.
	- Plan and implement required changes.

- [ ] Install Required Extensions
	- Only install extensions provided by `get_project_setup_info`.

- [ ] Compile the Project
	- Install dependencies, run diagnostics, resolve issues.

- [ ] Create and Run Task
	- Create a VS Code task only if needed.

- [ ] Launch the Project
	- Prompt user for debug mode and launch only if confirmed.

- [ ] Ensure Documentation is Complete
	- Ensure README is present and up to date.
	- Ensure this file has no HTML comments.
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.
