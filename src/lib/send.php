<?php

$errors = [];

if($_POST['confirm'] != 'on')
{
  $errors[] = ['code'    => 403,
               'message' => 'Необходимо подтверждение согласия с условиями договора и политикой конфиденциальности.'
              ];
}


if(isset($_POST))
{
  $data = filter_var_array($_POST,[
                            'phone'      => FILTER_SANITIZE_STRING,
                            'email'      => FILTER_SANITIZE_EMAIL,
                            'name'       => FILTER_SANITIZE_STRING,
                            'comment'    => FILTER_SANITIZE_STRING,
                            'shaker'     => FILTER_SANITIZE_STRING,
                            'total'      => FILTER_SANITIZE_STRING,
                            'module'     => FILTER_VALIDATE_BOOLEAN,
                            'telemetry'  => FILTER_VALIDATE_BOOLEAN,
                            'acceptor'   => FILTER_VALIDATE_BOOLEAN,
                            'pos'        => FILTER_VALIDATE_BOOLEAN,
                            'rfid'       => FILTER_VALIDATE_BOOLEAN
                          ]);

  $phone = (null != $data['phone']) ? '<p><b>Телефон</b>: ' . $data['phone'] . '</p>' : null;
  $email = (null != $data['email']) ? '<p><b>E-mail</b>: ' . $data['email'] . '</p>' : null;

  $to      = 'SedovSG@yandex.ru';
  $subject = 'Заявка с сайта';
  $boundary = md5(uniqid(time()));
  $headers = null;

  // Для отправки HTML-письма должен быть установлен заголовок Content-type
  $headers  = 'MIME-Version: 1.0' . "\r\n";
  $headers .= 'Content-type: text/html; Charset=UTF-8' . "\r\n";

  // Дополнительные заголовки
  $headers .= "From: ". $data['name'] . " <" . $data['email'] . ">";

  $message = '<html><head><title>Заявка с сайта</title></head><body>';

  $message .= '<p><b>Пользователь</b> "' . $data['name'] . '" оставил заявку: '.$data['comment'].'.</p>';
  $message .= $phone.$email;

  if($data['total'] !== null)
  {
    $message .= '<p>Оборудование: ' . $data['shaker'] . ', общей суммой: ' . $data['total'] . ' руб.</p>';
  }

  $message .= '</body></html>';

  if(!empty($errors)) {
    foreach($errors as $val) {
      http_response_code($val['code']);
    }

    die(json_encode($errors));
  }

  if(!mail($to, $subject, $message, $headers)) {
    http_response_code(500);
    die(json_encode('Ошибка отправки почты'));
  }
  
  http_response_code(200);
}
