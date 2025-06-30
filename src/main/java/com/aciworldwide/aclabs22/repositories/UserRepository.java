package com.aciworldwide.aclabs22.repositories;

import com.aciworldwide.aclabs22.entities.UserModel;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.CrudRepository;

import javax.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends CrudRepository<UserModel, UUID> {

    boolean existsByName(String name);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<UserModel> findByName(String name);
}
