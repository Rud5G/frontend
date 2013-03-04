with (scope('Issue', 'App')) {

  route('#repos/:login/:repository/issues/new', function(login, repository) {
    var target_div = div('Loading...');
    var params = get_params();

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/' + login + '/' + repository }, login + '/' + repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, 'Issues'),
        'New'
      ),

      target_div
    );

    BountySource.get_repository_overview(login, repository, function(response) {
      if (!response.meta.success) return render({ into: target_div }, response.data.error || response.data.message);

      var repo = response.data;

      render({into: target_div},
        section({ style: 'padding: 21px' },
          form({ action: curry(add_issue, repo) },

            div({ id: 'create-issue-errors' }),

            div({ 'class': 'title' },
              label({ 'for': 'title-input' }, 'Title'),
              text({ name: 'title', id: 'title-input', value: '', placeholder: 'Issue Title' })
            ),

            div({ 'class': 'number' },
              label({ 'for': 'number-input' }, 'Number'),
              text({ name: 'number', id: 'number-input', value: '', placeholder: 'Issue Number' })
            ),

            repo.type == "Generic::Repository" && div({ 'class': 'url' },
              label({ 'for': 'url-input' }, 'URL'),
              text({ name: 'url', id: 'url-input', value: '', placeholder: 'Issue URL' })
            ),

            submit({ 'class': 'blue' }, 'Create Issue')
          )
        )
      )
    });
  });

  define('add_issue', function(repo, form_data) {
    var issue_data = {
      title: form_data.title,
      number: form_data.number,
      url: form_data.url
    };

    BountySource.create_issue(
      issue_data,
      function(response) {
        var issue = response.data.issue;
        set_route(issue.frontend_url);
      },
      function(response) {
        render({ target: 'create-issue-errors' }, error_message(response));
      }
    );
  });

}
