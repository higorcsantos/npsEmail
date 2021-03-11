import { Request,Response } from "express"
import { getCustomRepository } from "typeorm";
import { SurveyRepository } from "../repositories/SurveyRepository";
import { SurveysUsersRepository } from "../repositories/SurveyUserRepository";
import { UserRepository } from "../repositories/UserRepository";
import SendMailServices from "../services/SendMailServices";
import {resolve} from 'path';


class SendMailController{
    async execute(request: Request, response: Response){
        const {email, survey_id} = request.body;
        const userRepository = getCustomRepository(UserRepository);
        const surveyRepository = getCustomRepository(SurveyRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const userAlreadyExists = await userRepository.findOne({email});
        if(!userAlreadyExists){
            return response.status(400).json({error: "User does not exists"});
        }
        const surveyAlreadyExists = await surveyRepository.findOne({id: survey_id});
        if(!surveyAlreadyExists){
            return response.status(400).json({error: "Survey does not exists"})
        }
        const npsPath = resolve(__dirname, "..","views","emails","npsMail.hbs");
        const variables = {
            name: userAlreadyExists.name,
            title: surveyAlreadyExists.title,
            description: surveyAlreadyExists.description,
            user_id: userAlreadyExists.id,
            link: process.env.URL_MAIL
        }
        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: [{user_id: userAlreadyExists.id}, {value: null}],
            relations: ['user','survey']
        });
        if(surveyUserAlreadyExists){
            await SendMailServices.execute(email, surveyAlreadyExists.title,variables,npsPath);
            return response.json(surveyAlreadyExists)
        }

        const surveyUser = surveysUsersRepository.create({
            user_id: userAlreadyExists.id,
            survey_id,
        });
        await surveysUsersRepository.save(surveyUser);
        
        await SendMailServices.execute(email,surveyAlreadyExists.title, variables,npsPath);
        return response.status(200).json(surveyUser);
    }
}

export {SendMailController}