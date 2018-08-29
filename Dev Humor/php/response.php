<?php

     // TO DO htmlspeciachars
     // require db file
    $db_user = 'root';
    $db_password = 'root';

    $upload_destination = 'user/';

    if($_SERVER['REQUEST_METHOD'] === 'POST'){
      // Stores file name to notify user about files that did't get uploaded
      $upload_error = [];
      // Stores id from db for files that were uploaded
      $upload_success = [];

      try{
          // open connection
          $conn = new PDO('mysql:host=localhost;dbname=web;',$db_user, $db_password);
          // setting PDO error mode to exception
          $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

          // traverse the POST array to get the description and the img
          foreach($_POST as $img => $description){
              // sanitize input
              $description = htmlspecialchars($description);
              $_FILES[$img]['name'] = htmlspecialchars( $_FILES[$img]['name']);

              // SQL INSERT
              // prepare SQL statement to isnert description and the name of the file
              $sql = $conn->prepare("INSERT INTO `user` (description, file_name) VALUES
                                    (:description, :file_name)");
              // execute returns true on successful insertion to the database
              $is_info_uploaded = $sql->execute([':description' => $description, ':file_name' => $_FILES[$img]['name']]);

              // file name stored on server id-filename
              $last_id = $conn->lastInsertId();
              $fileName = $last_id . '-' . $_FILES[$img]['name'];

              // update file name on db to avoid overhead of concat
              $sql = $conn->prepare("UPDATE `user` SET file_name = '$fileName' where id = $last_id");
              $is_info_uploaded = $sql->execute();

              // upload file to the server if insertion to the db is successful
              if($is_info_uploaded){
                  // PHP UPLOAD
                  $is_file_uploaded = move_uploaded_file($_FILES[$img]['tmp_name'], $upload_destination . $fileName);
                  if($is_file_uploaded){
                      $upload_success[] = [
                                            "id" => $last_id,
                                            "description" => $description,
                                          ];
                  }else{
                    // delete record from the database
                    $sql = $conn->prepare("DELETE FROM `user` WHERE id = $last_id");

                    // update error responses
                    $upload_error[] = ["fileName" => $_FILES[$img]['name']];
                  }
                  }else{
                      // update error responses
                      $upload_error[] = ["fileName" => $_FILES[$img]['name']];
                  }
              }

          }catch(PDOException $e){
              echo '<p> exception';
              echo $e->getMessage();
          }

          $conn = null;

          // sending json response back
          echo json_encode(["success" => $upload_success, "failure" => $upload_error]);

    }else if($_SERVER['REQUEST_METHOD'] === 'GET'){
          // this has to exist
          $id = intval($_GET["id"]);

          try{
            // open connection
            $conn = new PDO('mysql:host=localhost;dbname=web;',$db_user, $db_password);
            // setting PDO error mode to exception
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $sql = $conn->prepare("SELECT file_name from user WHERE id = $id");
            $sql->execute();


            $file_name = $sql->fetch();
            echo json_encode(["path" => "php/user/" . $file_name['file_name']]);

            // error handling?

        }catch(PDOException $e){
            echo '<p> exception';
            echo $e->getMessage();
        }

        $conn = null;
    }



    /*
    function getDBConnection(){
          try{
              // open connection
              $conn = new PDO('mysql:host=localhost;dbname=web;',$db_user, $db_password);
              // setting PDO error mode to exception
              $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
          }catch(PDOException $pdoe){
              die($pdoe->getMessage());
          }
    }*/

?>
