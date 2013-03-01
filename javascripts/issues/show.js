with (scope('Issue', 'App')) {

  route('#repos/:login/:repository/issues/:issue_number', function(login, repository, issue_number) {
    var target_div = div('Loading...');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#repos/' + login + '/' + repository }, login + '/' + repository),
        a({ href: '#repos/' + login + '/' + repository + '/issues' }, 'Issues'),
        '#' + issue_number
      ),

      target_div
    );

    BountySource.get_issue(login, repository, issue_number, function(response) {
      var issue = response.data||{};

      App.update_facebook_like_button({
        name:         issue.repository.display_name+": Issue #"+issue.number,
        caption:      issue.title,
        description:  "BountySource is the funding platform for open-source software. Create a bounty to help get this issue resolved, or submit a pull request to earn the bounty yourself!",
        picture:      issue.repository.owner.avatar_url
      });

      render({ into: target_div },
        div({ 'class': 'split-main' },
          curry(DeveloperBox.solution_status_for_issue, issue),

          // used to render messages into
          messages(),

          // title of issue, with closed or open notification.
          // if issue is closed, add line-through
          h1({ style: 'font-size: 26px; line-height: 30px; font-weight: normal; color: #565656' }, 
            span({ style: issue.closed ? 'text-decoration: line-through;' : '' }, '#' + issue.number + ': ' + issue.title),
            div({ style: 'padding-left: 20px; display: inline-block;' }, Issue.status_element(issue))
          ),

          github_user_html_box({ user: issue.user, body_html: issue.body, created_at: issue.remote_created_at }),

          div({ style: 'margin: 25px 0;' },
            div({ style: 'display: inline-block; vertical-align: middle; margin-right: 10px;' }, 'For more information, or to comment:'),
            a({ 'class': 'btn-auth btn-github', style: 'display: inline-block; vertical-align: middle;', href: issue.url, target: '_blank' }, 'View Issue on GitHub')
          ),

          issue.comments.length > 0 && div(
            h2({ style: 'font-size: 26px; line-height: 30px; font-weight: normal; color: #565656' }, 'Comments'),
            issue.comments.map(github_user_html_box)
          )
        ),

        div({ 'class': 'split-side'},
          !issue.closed && !issue.code && section(
            bounty_box(issue),
            DeveloperBox.create(issue)
          )
        ),

        div({ 'class': 'split-end' })
      );
    });
  });
  
  define('github_user_html_box', function(options) {
    var user = options.user;

    return div({ style: 'margin-bottom: -1px' },
      img({ src: user.avatar_url, style: 'width: 50px; height: 50px; float: left' }),

      div({ style: 'margin-left: 70px; background: #f7f7f7; border-top: 1px solid #e3e3e3; border-bottom: 1px solid #e3e3e3; overflow: auto; padding: 10px;' },
        div({ style: 'color: #b4b4b4; margin-bottom: 6px' }, user.login, ' commented ', time_ago_in_words(options.created_at), ' ago:'),
      
        div({ 'class': 'gfm', html: options.body_html })
      )
    );
  });
  
  define('bounty_box', function(issue) {
    return div({ id: 'bounty-box' },
      div({ style: 'padding: 0 21px' }, ribbon_header("Backers")),
      
      issue.bounty_total > 0 && section(
        div({ 'class': 'total_bounties' }, money(issue.bounty_total)),
        div({ style: 'text-align: center' }, "From ", issue.bounties.length, " bount" + (issue.bounties.length == 1 ? 'y' : 'ies') + ".")
      ),

      section({ style: 'padding: 21px' },
        form({ action: curry(create_bounty, issue) },

          div({ id: 'create-bounty-errors' }),

          div({ 'class': 'amount' },
            label({ 'for': 'amount-input' }, '$'),
            text({ placeholder: "25", name: 'amount', id: 'amount-input', value: get_params().amount || '' })
          ),

          Payment.payment_methods({ style: 'margin: 10px 0;', value: get_params().payment_method }),

          submit({ 'class': 'blue' }, 'Create Bounty')
        )
      )
    );
  });

  define('create_bounty', function(issue, form_data) {
    var payment_data = {
      amount: form_data.amount,
      payment_method: form_data.payment_method,
      item_number: 'github/' + issue.repository.full_name + '/issues/' + issue.number,
      success_url: window.location.href.split('#')[0] + '#repos/' + issue.repository.full_name + '/issues/' + issue.number + '/bounties/:item_id/receipt',
      cancel_url: window.location.href.split('#')[0] + '#repos/' + issue.repository.full_name + '/issues/' + issue.number,
      postauth_url: window.location.href.split('#')[0] + '#repos/' + issue.repository.full_name + '/issues/' + issue.number + '?payment_method='+form_data.payment_method+'&amount='+form_data.amount
    };

    BountySource.make_payment(payment_data, function(errors) {
      render({ target: 'create-bounty-errors' }, error_message(errors));
    });
  });
}
